import { ReactNode } from "react";
import { useFetcher } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Edit2, Trash2, Save, X, Plus } from "lucide-react";

interface ResourceCrudLayoutProps<T> {
  items: T[];
  title: string;
  description: string;
  renderCard: (item: T, onEdit: () => void) => ReactNode;
  renderForm: (item: T | null, onCancel: () => void, intent: "create" | "update") => ReactNode;
  editingId: string | null;
  showCreateForm: boolean;
  onSetEditingId: (id: string | null) => void;
  onSetShowCreateForm: (show: boolean) => void;
}

export function ResourceCrudLayout<T extends { id: string }>({
  items,
  title,
  description,
  renderCard,
  renderForm,
  editingId,
  showCreateForm,
  onSetEditingId,
  onSetShowCreateForm,
}: ResourceCrudLayoutProps<T>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2">{description}</p>
        </div>
        <Button onClick={() => onSetShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div>{renderForm(null, () => onSetShowCreateForm(false), "create")}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id}>
            {editingId === item.id
              ? renderForm(item, () => onSetEditingId(null), "update")
              : renderCard(item, () => onSetEditingId(item.id))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResourceCard({
  title,
  children,
  onEdit,
  onDelete,
  deleteDisabled = false,
}: {
  title: string;
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  deleteDisabled?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm mb-4">{children}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit} className="flex-1">
            <Edit2 className="w-3 h-3 mr-1" />
            Modifier
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
            disabled={deleteDisabled}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourceForm({
  title,
  children,
  onCancel,
  isSubmitting,
}: {
  title: string;
  children: ReactNode;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children}
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

