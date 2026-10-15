import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

// Shown instead of React Router's developer error screen when a page fails
// to render, so visitors get a way back rather than a stack trace.
const RouteError = () => {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;

  if (import.meta.env.DEV) console.error(error);

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-50 px-4 font-sans">
      <div className="max-w-md text-center">
        <p className="font-display text-6xl font-extrabold text-amber-400">{notFound ? "404" : "Oops"}</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-stone-900">
          {notFound ? "This page does not exist" : "Something went wrong on this page"}
        </h1>
        <p className="mt-2 text-stone-600">
          {notFound ? "The link may be old or mistyped." : "Please try again. If it keeps happening, let us know."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {!notFound && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800"
            >
              Reload the page
            </button>
          )}
          <Link to="/" className="rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 hover:border-stone-400">
            Go to the home page
          </Link>
        </div>
      </div>
    </main>
  );
};

export default RouteError;
