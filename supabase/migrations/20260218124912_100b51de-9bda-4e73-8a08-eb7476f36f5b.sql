
-- Add is_pinned column to community_posts
ALTER TABLE public.community_posts ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

-- Allow admins to update any post (needed to pin/unpin others' posts)
CREATE POLICY "Admins can update any post"
ON public.community_posts
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
