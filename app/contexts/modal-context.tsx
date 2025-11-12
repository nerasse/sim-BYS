import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

interface AlertOptions {
  title: string;
  description: string;
  confirmText?: string;
}

interface ModalContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  alert: (options: AlertOptions) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const [promptState, setPromptState] = useState<{
    isOpen: boolean;
    options: PromptOptions;
    resolve: (value: string | null) => void;
    inputValue: string;
  } | null>(null);

  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const prompt = useCallback((options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptState({
        isOpen: true,
        options,
        resolve,
        inputValue: options.defaultValue || "",
      });
    });
  }, []);

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleConfirmClose = (confirmed: boolean) => {
    if (confirmState) {
      confirmState.resolve(confirmed);
      setConfirmState(null);
    }
  };

  const handlePromptClose = (value: string | null) => {
    if (promptState) {
      promptState.resolve(value);
      setPromptState(null);
    }
  };

  const handleAlertClose = () => {
    if (alertState) {
      alertState.resolve();
      setAlertState(null);
    }
  };

  return (
    <ModalContext.Provider value={{ confirm, prompt, alert }}>
      {children}

      {/* Confirm Dialog */}
      {confirmState && (
        <Dialog
          open={confirmState.isOpen}
          onOpenChange={(open) => !open && handleConfirmClose(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmState.options.title}</DialogTitle>
              <DialogDescription>{confirmState.options.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleConfirmClose(false)}>
                {confirmState.options.cancelText || "Annuler"}
              </Button>
              <Button
                variant={confirmState.options.variant || "default"}
                onClick={() => handleConfirmClose(true)}
              >
                {confirmState.options.confirmText || "Confirmer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Prompt Dialog */}
      {promptState && (
        <Dialog
          open={promptState.isOpen}
          onOpenChange={(open) => !open && handlePromptClose(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{promptState.options.title}</DialogTitle>
              {promptState.options.description && (
                <DialogDescription>{promptState.options.description}</DialogDescription>
              )}
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="prompt-input" className="sr-only">
                Input
              </Label>
              <Input
                id="prompt-input"
                value={promptState.inputValue}
                onChange={(e) =>
                  setPromptState({
                    ...promptState,
                    inputValue: e.target.value,
                  })
                }
                placeholder={promptState.options.placeholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handlePromptClose(promptState.inputValue);
                  } else if (e.key === "Escape") {
                    handlePromptClose(null);
                  }
                }}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handlePromptClose(null)}>
                {promptState.options.cancelText || "Annuler"}
              </Button>
              <Button onClick={() => handlePromptClose(promptState.inputValue)}>
                {promptState.options.confirmText || "Confirmer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Alert Dialog */}
      {alertState && (
        <Dialog
          open={alertState.isOpen}
          onOpenChange={(open) => !open && handleAlertClose()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{alertState.options.title}</DialogTitle>
              <DialogDescription>{alertState.options.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleAlertClose}>
                {alertState.options.confirmText || "OK"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

