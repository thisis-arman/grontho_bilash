import { FileQuestion } from "lucide-react";
import {
  Suggestion,
  useDeleteSuggestionMutation,
  useGetAdminSuggestionsQuery,
} from "../../../../redux/features/content/contentApi";
import ContentAdminList from "./ContentAdminList";

// Past question papers live in the suggestions collection with kind "question".
const useQuestionList = (params: Record<string, string | number | undefined>) =>
  useGetAdminSuggestionsQuery({ ...params, kind: "question" });

const QuestionAdmin = () => (
  <ContentAdminList<Suggestion>
    title="Question bank"
    description="Publish past exam papers (board, university, admission and job exams) as PDFs, images or text."
    newLabel="New question paper"
    basePath="/admin/questions"
    publicPath="/questions"
    icon={FileQuestion}
    useList={useQuestionList}
    useDelete={useDeleteSuggestionMutation}
    subtitle={(item) =>
      [item.level, item.institution, item.examYear, item.subjectCode || item.subject, `${item.attachments.length} file${item.attachments.length === 1 ? "" : "s"}`]
        .filter(Boolean)
        .join(" · ")
    }
  />
);

export default QuestionAdmin;
