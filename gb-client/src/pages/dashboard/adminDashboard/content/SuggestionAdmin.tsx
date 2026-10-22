import { DownloadCloud, NotebookPen } from "lucide-react";
import { toast } from "sonner";
import {
  Suggestion,
  useDeleteSuggestionMutation,
  useGetAdminSuggestionsQuery,
  useImportPracticeSetsMutation,
} from "../../../../redux/features/content/contentApi";
import { btn, errorMessage } from "../../../../components/dashboard/ui";
import ContentAdminList from "./ContentAdminList";

// Adds the team-written BCS preliminary practice sets as drafts to review.
const ImportPractice = () => {
  const [run, { isLoading }] = useImportPracticeSetsMutation();
  return (
    <button
      type="button"
      disabled={isLoading}
      className={btn.secondary}
      onClick={async () => {
        try {
          const { data } = await run().unwrap();
          toast.success(
            data.added
              ? `Added ${data.added} BCS practice sets as drafts. Review and publish them.`
              : "The BCS practice sets are already here."
          );
        } catch (error) {
          toast.error(errorMessage(error, "Import failed"));
        }
      }}
    >
      <DownloadCloud size={16} aria-hidden="true" /> {isLoading ? "Importing…" : "Import BCS practice sets"}
    </button>
  );
};

const SuggestionAdmin = () => (
  <ContentAdminList<Suggestion>
    title="Suggestions"
    description="Publish exam suggestions and practice sets as text, PDFs or images. Drafts stay private until you publish."
    newLabel="New suggestion"
    basePath="/admin/suggestions"
    publicPath="/suggestions"
    icon={NotebookPen}
    useList={useGetAdminSuggestionsQuery}
    useDelete={useDeleteSuggestionMutation}
    extraAction={<ImportPractice />}
    subtitle={(item) =>
      [item.level, item.subjectCode || item.subject, `${item.attachments.length} file${item.attachments.length === 1 ? "" : "s"}`]
        .filter(Boolean)
        .join(" · ")
    }
  />
);

export default SuggestionAdmin;
