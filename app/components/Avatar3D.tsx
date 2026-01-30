'use client';

// Legacy FBX avatar is deprecated. GLB avatar is the primary implementation.
// This stub satisfies existing imports without bundling three.js loaders.

type Avatar3DProps = {
  fbxUrl?: string;
  onAvatarClick?: () => void;
  isWalking?: boolean;
};

export default function Avatar3D(_props: Avatar3DProps) {
  return null;
}
