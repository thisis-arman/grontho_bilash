import { NotebookPen } from "lucide-react";
import { Suggestion, useDeleteSuggestionMutation, useGetAdminSuggestionsQuery } from "../../../../redux/features/content/contentApi";
import ContentAdminList from "./ContentAdminList";

const SuggestionAdmin = () => (
  <ContentAdminList<Suggestion>
    title="Suggestions"
    description="Publish exam suggestions as text, PDFs or images. Drafts stay private until you publish."
    newLabel="New suggestion"
    basePath="/admin/suggestions"
    publicPath="/suggestions"
    icon={NotebookPen}
    useList={useGetAdminSuggestionsQuery}
    useDelete={useDeleteSuggestionMutation}
    subtitle={(item) =>
      [item.level, item.subjectCode || item.subject, `${item.attachments.length} file${item.attachments.length === 1 ? "" : "s"}`]
        .filter(Boolean)
        .join(" · ")
    }
  />
);

export default SuggestionAdmin;
