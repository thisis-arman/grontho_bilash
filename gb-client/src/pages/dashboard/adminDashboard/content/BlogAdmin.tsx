import { Newspaper } from "lucide-react";
import { BlogPost, useDeleteBlogPostMutation, useGetAdminBlogPostsQuery } from "../../../../redux/features/content/contentApi";
import ContentAdminList from "./ContentAdminList";

const BlogAdmin = () => (
  <ContentAdminList<BlogPost>
    title="Blog"
    description="Write book reviews, study tips and guides. Drafts stay private until you publish."
    newLabel="New post"
    basePath="/admin/blogs"
    publicPath="/blogs"
    icon={Newspaper}
    useList={useGetAdminBlogPostsQuery}
    useDelete={useDeleteBlogPostMutation}
    subtitle={(post) => `${post.category} · ${post.readingTime} min read`}
  />
);

export default BlogAdmin;
