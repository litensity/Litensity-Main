import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ButtonLink } from "@/components/ui/Button";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className={styles.page}>
        <p className={styles.code} aria-hidden="true">
          4<span>0</span>4
        </p>
        <h1 className={styles.title}>
          This plate is <em>empty.</em>
        </h1>
        <p className={styles.body}>The page you were looking for has moved, sold out, or never made it to the menu.</p>
        <div className={styles.actions}>
          <ButtonLink href="/" size="lg">
            Back to home
          </ButtonLink>
          <ButtonLink href="/stores" size="lg" variant="outline" icon="pin">
            Find a store
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
