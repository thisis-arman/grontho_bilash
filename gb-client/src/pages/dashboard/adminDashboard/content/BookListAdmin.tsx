import { ListChecks } from "lucide-react";
import { BookList, useDeleteBookListMutation, useGetAdminBookListsQuery } from "../../../../redux/features/hub/hubApi";
import ContentAdminList from "./ContentAdminList";

const useLists = (params: Record<string, string | number | undefined>) => useGetAdminBookListsQuery(params);

const BookListAdmin = () => (
  <ContentAdminList<BookList>
    title="Book lists"
    description="“Which books do I need?” lists for each class, department and year. Students see how many used copies are for sale."
    newLabel="New book list"
    basePath="/admin/booklists"
    publicPath="/booklists"
    icon={ListChecks}
    useList={useLists}
    useDelete={useDeleteBookListMutation}
    subtitle={(list) =>
      [list.level, list.institution, list.department, list.academicYear, `${list.books?.length ?? 0} books`].filter(Boolean).join(" · ")
    }
  />
);

export default BookListAdmin;
