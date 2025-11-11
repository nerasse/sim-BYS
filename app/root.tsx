import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { NavBar } from "~/components/layout/nav-bar";
import { getActivePreset } from "~/db/queries/active-preset";
import "~/styles/global.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const activePresetData = await getActivePreset();
  
  return json({
    activePreset: activePresetData?.preset || null,
  });
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { activePreset } = useLoaderData<typeof loader>();
  
  return (
    <>
      <NavBar activePreset={activePreset} />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </>
  );
}

