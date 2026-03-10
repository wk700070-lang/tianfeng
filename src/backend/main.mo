import Int "mo:core/Int";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile type and storage
  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Forum post types
  type Post = {
    id : Nat;
    title : Text;
    content : Text;
    author : Text;
    timestamp : Time.Time;
    likes : Nat;
    comments : [Comment];
  };

  type Comment = {
    content : Text;
    author : Text;
    timestamp : Time.Time;
  };

  module Post {
    public func compare(post1 : Post, post2 : Post) : Order.Order {
      Int.compare(post2.timestamp, post1.timestamp);
    };
  };

  // Consulting types
  type UserConsulting = {
    remainingConsultations : Nat;
    lastReset : Time.Time;
  };

  // Public types
  public type PostUpdateRequest = {
    title : Text;
    content : Text;
    author : Text;
  };

  public type CommentUpdateRequest = {
    content : Text;
    author : Text;
  };

  // State
  let posts = List.empty<Post>();
  var nextPostId = 0;

  let userConsultings = Map.empty<Principal, UserConsulting>();

  // Create post - requires user authentication
  public shared ({ caller }) func createPost(request : PostUpdateRequest) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let post : Post = {
      id = nextPostId;
      title = request.title;
      content = request.content;
      author = request.author;
      timestamp = Time.now();
      likes = 0;
      comments = [];
    };
    posts.add(post);
    nextPostId += 1;
    post;
  };

  // Get all posts - public access (including guests)
  public query ({ caller }) func getAllPosts() : async [Post] {
    posts.toArray().sort();
  };

  // Get post by ID - public access (including guests)
  public query ({ caller }) func getPostById(postId : Nat) : async ?Post {
    posts.toArray().find(
      func(p) {
        p.id == postId;
      }
    );
  };

  // Like post - requires user authentication
  public shared ({ caller }) func likePost(postId : Nat) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    updatePost(postId, func(p) { { p with likes = p.likes + 1 } });
  };

  // Unlike post - requires user authentication
  public shared ({ caller }) func unlikePost(postId : Nat) : async ?Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unlike posts");
    };

    updatePost(postId, func(p) { { p with likes = if (p.likes > 0) { p.likes - 1 } else { 0 } } });
  };

  // Add comment - requires user authentication
  public shared ({ caller }) func addCommentToPost(postId : Nat, request : CommentUpdateRequest) : async ?Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    updatePostFull(
      postId,
      func(p) {
        let newComment : Comment = {
          content = request.content;
          author = request.author;
          timestamp = Time.now();
        };
        { p with comments = p.comments.concat([newComment]) };
      },
    );
  };

  // Get remaining consultations - users can only query their own, admins can query any
  public query ({ caller }) func getRemainingFreeConsultations(user : Principal) : async Nat {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own consultation quota");
    };

    switch (userConsultings.get(user)) {
      case (?consulting) {
        if (hasDayPassed(consulting.lastReset)) { 5 } else { consulting.remainingConsultations };
      };
      case (null) { 5 };
    };
  };

  // Consume consultation - users can only consume their own, admins can manage any
  public shared ({ caller }) func consumeConsultation(user : Principal) : async Bool {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only consume your own consultations");
    };

    switch (userConsultings.get(user)) {
      case (?userConsulting) {
        if (hasDayPassed(userConsulting.lastReset)) {
          userConsultings.add(user, { remainingConsultations = 4; lastReset = Time.now() });
          true;
        } else if (userConsulting.remainingConsultations > 0) {
          userConsultings.add(
            user,
            {
              remainingConsultations = userConsulting.remainingConsultations - 1;
              lastReset = userConsulting.lastReset;
            },
          );
          true;
        } else { false };
      };
      case (null) {
        userConsultings.add(user, { remainingConsultations = 4; lastReset = Time.now() });
        true;
      };
    };
  };

  // Helper function to check if a day has passed
  func hasDayPassed(lastReset : Time.Time) : Bool {
    let currentTime = Time.now();
    let oneDayInNanos : Int = 24 * 60 * 60 * 1_000_000_000;
    currentTime - lastReset >= oneDayInNanos;
  };

  // Helper function to update post (returns likes count)
  func updatePost(postId : Nat, updateFunc : Post -> Post) : ?Nat {
    let updatedPosts = posts.toArray().map(
      func(p) {
        if (p.id == postId) { updateFunc(p) } else { p };
      }
    );
    let updatedPost = updatedPosts.find(
      func(p) {
        p.id == postId;
      }
    );
    switch (updatedPost) {
      case (?post) {
        posts.clear();
        posts.addAll(updatedPosts.values());
        ?post.likes;
      };
      case (null) { null };
    };
  };

  // Helper function to update post (returns full post)
  func updatePostFull(postId : Nat, updateFunc : Post -> Post) : ?Post {
    let updatedPosts = posts.toArray().map(
      func(p) {
        if (p.id == postId) { updateFunc(p) } else { p };
      }
    );
    let updatedPost = updatedPosts.find(
      func(p) {
        p.id == postId;
      }
    );
    switch (updatedPost) {
      case (?post) {
        posts.clear();
        posts.addAll(updatedPosts.values());
        ?post;
      };
      case (null) { null };
    };
  };
};
