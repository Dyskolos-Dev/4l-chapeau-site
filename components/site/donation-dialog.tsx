"use client";

import {
  createContext,
  type AnchorHTMLAttributes,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SiteSettings } from "@/lib/content";
import { cn } from "@/lib/utils";

type DonationSettings = SiteSettings["support"]["donation"];

type DonationContextValue = {
  config: DonationSettings;
  directUrl: string | null;
  isAvailable: boolean;
  openDonation: () => void;
};

const DonationContext = createContext<DonationContextValue | null>(null);
const initialFrameHeight = 720;
const minFrameHeight = 520;
const maxFrameHeight = 1_600;

function trustedHelloAssoUrl(value: string) {
  try {
    const url = new URL(value);
    const isHelloAsso =
      url.hostname === "www.helloasso.com" || url.hostname === "helloasso.com";

    return url.protocol === "https:" && isHelloAsso && url.pathname.startsWith("/associations/")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function DonationWidgetFrame({
  widgetOrigin,
  widgetUrl,
}: {
  widgetOrigin: string;
  widgetUrl: string;
}) {
  const [frameHeight, setFrameHeight] = useState(initialFrameHeight);
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const resizeWidget = (event: MessageEvent<unknown>) => {
      if (
        event.origin !== widgetOrigin ||
        event.source !== frameRef.current?.contentWindow ||
        typeof event.data !== "object" ||
        event.data === null ||
        !("height" in event.data)
      ) {
        return;
      }

      const requestedHeight = (event.data as { height?: unknown }).height;
      if (typeof requestedHeight !== "number" || !Number.isFinite(requestedHeight)) return;

      setFrameHeight(
        Math.min(maxFrameHeight, Math.max(minFrameHeight, Math.round(requestedHeight))),
      );
    };

    window.addEventListener("message", resizeWidget);
    return () => window.removeEventListener("message", resizeWidget);
  }, [widgetOrigin]);

  return (
    <div className="nova-donation-frame-shell">
      <iframe
        allow="payment 'self' https://paymenthub.helloassopay.com https://helloasso.com"
        allowTransparency
        className="nova-donation-frame"
        ref={frameRef}
        referrerPolicy="strict-origin-when-cross-origin"
        scrolling="auto"
        src={widgetUrl}
        style={{ height: `${frameHeight}px` }}
        title="Formulaire de don HelloAsso pour 4L CHAPEAU"
      />
    </div>
  );
}

export function DonationDialogProvider({
  children,
  donation,
}: {
  children: ReactNode;
  donation: DonationSettings;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const widgetUrl = trustedHelloAssoUrl(donation.widgetUrl);
  const directUrl = trustedHelloAssoUrl(donation.directUrl);
  const widgetOrigin = widgetUrl ? new URL(widgetUrl).origin : null;
  const isDialogOpen = isOpen && Boolean(widgetUrl && widgetOrigin);

  const contextValue = useMemo<DonationContextValue>(
    () => ({
      config: donation,
      directUrl,
      isAvailable: Boolean(widgetUrl),
      openDonation: () => {
        if (widgetUrl) setIsOpen(true);
      },
    }),
    [directUrl, donation, widgetUrl],
  );

  return (
    <DonationContext.Provider value={contextValue}>
      {children}
      {widgetUrl ? (
        <Dialog onOpenChange={setIsOpen} open={isDialogOpen}>
          {isDialogOpen && widgetOrigin ? (
            <DialogContent className="nova-donation-dialog" showCloseButton={false}>
              <DialogHeader className="nova-donation-dialog-head">
                <DialogTitle className="nova-donation-dialog-title">
                  {donation.dialogTitle || "Soutenir 4L CHAPEAU"}
                </DialogTitle>
                <DialogDescription className="nova-donation-dialog-description">
                  {donation.dialogDescription}
                </DialogDescription>
                <DialogClose asChild>
                  <button
                    aria-label="Fermer la fenêtre de don"
                    className="nova-donation-dialog-close"
                    type="button"
                  >
                    Fermer
                  </button>
                </DialogClose>
              </DialogHeader>

              <DonationWidgetFrame widgetOrigin={widgetOrigin} widgetUrl={widgetUrl} />

              {directUrl ? (
                <p className="nova-donation-fallback">
                  Le formulaire ne s’affiche pas ?{" "}
                  <a href={directUrl} rel="noopener noreferrer" target="_blank">
                    {donation.fallbackLabel || "Ouvrir HelloAsso dans un nouvel onglet"}
                  </a>
                </p>
              ) : null}
            </DialogContent>
          ) : null}
        </Dialog>
      ) : null}
    </DonationContext.Provider>
  );
}

export function DonationTrigger({
  children,
  className,
  fallbackHref = "/soutenir",
  onClick,
  ...anchorProps
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  fallbackHref?: string;
}) {
  const donation = useContext(DonationContext);
  const label = children ?? donation?.config.buttonLabel ?? "Faire un don";

  if (!donation?.isAvailable) {
    return (
      <a {...anchorProps} className={className} href={fallbackHref} onClick={onClick}>
        {label}
      </a>
    );
  }

  return (
    <a
      {...anchorProps}
      aria-haspopup="dialog"
      className={cn("nova-donation-trigger", className)}
      href={donation.directUrl ?? fallbackHref}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          event.preventDefault();
          donation.openDonation();
        }
      }}
    >
      {label}
    </a>
  );
}
