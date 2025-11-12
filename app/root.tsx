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
import { getAllPresets } from "~/db/queries/presets";
import "~/styles/global.css";

export async function loader({ request }: LoaderFunctionArgs) {
  const [activePresetData, allPresets] = await Promise.all([
    getActivePreset(),
    getAllPresets(),
  ]);
  
  return json({
    activePreset: activePresetData?.preset || null,
    allPresets,
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
  const { activePreset, allPresets } = useLoaderData<typeof loader>();
  
  return (
    <>
      <NavBar activePreset={activePreset} allPresets={allPresets} />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </>
  );
}

