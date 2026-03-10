import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CommentUpdateRequest {
    content: string;
    author: string;
}
export type Time = bigint;
export interface Comment {
    content: string;
    author: string;
    timestamp: Time;
}
export interface Post {
    id: bigint;
    title: string;
    content: string;
    author: string;
    likes: bigint;
    timestamp: Time;
    comments: Array<Comment>;
}
export interface PostUpdateRequest {
    title: string;
    content: string;
    author: string;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCommentToPost(postId: bigint, request: CommentUpdateRequest): Promise<Post | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    consumeConsultation(user: Principal): Promise<boolean>;
    createPost(request: PostUpdateRequest): Promise<Post>;
    getAllPosts(): Promise<Array<Post>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getPostById(postId: bigint): Promise<Post | null>;
    getRemainingFreeConsultations(user: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<bigint | null>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unlikePost(postId: bigint): Promise<bigint | null>;
}
