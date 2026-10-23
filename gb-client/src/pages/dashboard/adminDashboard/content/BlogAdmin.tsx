import { BookOpenCheck, Newspaper } from "lucide-react";
import { toast } from "sonner";
import {
  BlogPost,
  useDeleteBlogPostMutation,
  useGetAdminBlogPostsQuery,
  useImportGuidesMutation,
} from "../../../../redux/features/content/contentApi";
import { btn, errorMessage } from "../../../../components/dashboard/ui";
import ContentAdminList from "./ContentAdminList";

// Publishes the team-written guides (buying, pricing, CGPA, BCS, digital
// notes) under your name. Guides already on the blog are skipped.
const PublishGuides = () => {
  const [run, { isLoading }] = useImportGuidesMutation();
  return (
    <button
      type="button"
      disabled={isLoading}
      className={btn.secondary}
      onClick={async () => {
        try {
          const { data } = await run().unwrap();
          toast.success(data.created ? `Published ${data.created} GB guides on the blog.` : "All GB guides are already published.");
        } catch (error) {
          toast.error(errorMessage(error, "Publishing failed"));
        }
      }}
    >
      <BookOpenCheck size={16} aria-hidden="true" /> {isLoading ? "Publishing…" : "Publish GB guides"}
    </button>
  );
};

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
    extraAction={<PublishGuides />}
    subtitle={(post) => `${post.category} · ${post.readingTime} min read`}
  />
);

export default BlogAdmin;
