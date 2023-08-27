import React from 'react';
import PostCard from './PostCard';

function PostCards({ posts }) {
  return (
    <>
      {posts.map((post) => (
        <PostCard key={post.postId} {...post} />
      ))}
    </>
  );
}

export default PostCards;
