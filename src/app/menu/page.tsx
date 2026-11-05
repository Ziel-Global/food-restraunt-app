"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icons } from "@/components/icons";
import { useRestaurantWorkspace, type ModifierGroup, type ModifierOption } from "@/components/restaurant-context";
import { Badge, Button, Notice, PageTitle, Panel, Search, SelectField, SelectPill, StatCard } from "@/components/ui";

const categories = ["All items", "Popular", "Mains", "Sides", "Drinks"];
const formCategories = ["Mains", "Sides", "Drinks", "Popular"];

function formatModifierRule(group: ModifierGroup) {
  if (group.required && group.maxChoices === 1) return "Required · choose 1";
  if (group.required) return `Required · choose up to ${group.maxChoices}`;
  if (group.maxChoices === 1) return "Optional · choose 1";
  return `Optional · choose up to ${group.maxChoices}`;
}

function emptyOption(): ModifierOption {
  return { id: `MO-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name: "", price: "0" };
}

async function fileToStoredImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image"));
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const max = 720;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => reject(new Error("Could not process image"));
    img.src = dataUrl;
  });
}

function categoryFallback(category: string) {
  if (category === "Drinks") return "🥤";
  if (category === "Sides") return "🍟";
  return "🥙";
}

export default function MenuPage() {
  const {
    menu,
    toggleMenuItem,
    addMenuItem,
    modifiers,
    addModifierGroup,
    updateModifierGroup,
    deleteModifierGroup,
  } = useRestaurantWorkspace();
  const [category, setCategory] = useState("All items");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [prep, setPrep] = useState("15");
  const [newCategory, setNewCategory] = useState("Mains");
  const [image, setImage] = useState<string | undefined>();
  const [imageName, setImageName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [manageOpen, setManageOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState("");
  const [groupRequired, setGroupRequired] = useState("Optional");
  const [groupMax, setGroupMax] = useState("1");
  const [groupOptions, setGroupOptions] = useState<ModifierOption[]>([emptyOption(), emptyOption()]);
  const [groupError, setGroupError] = useState("");

  const visible = useMemo(
    () =>
      menu.filter(
        (item) =>
          category === "All items" || item.category === category || (category === "Popular" && item.popular),
      ),
    [category, menu],
  );

  useEffect(() => {
    if (!open && !groupOpen && !manageOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (groupOpen) closeGroupModal();
      else if (manageOpen) setManageOpen(false);
      else if (open) closeModal();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, groupOpen, manageOpen]);

  function resetForm() {
    setName("");
    setDesc("");
    setPrice("");
    setPrep("15");
    setNewCategory("Mains");
    setImage(undefined);
    setImageName("");
    setError("");
    setDragOver(false);
    setUploading(false);
  }

  function closeModal() {
    setOpen(false);
    resetForm();
  }

  function resetGroupForm() {
    setEditingGroupId(null);
    setGroupName("");
    setGroupRequired("Optional");
    setGroupMax("1");
    setGroupOptions([emptyOption(), emptyOption()]);
    setGroupError("");
  }

  function closeGroupModal() {
    setGroupOpen(false);
    resetGroupForm();
  }

  function openCreateGroup() {
    resetGroupForm();
    setGroupOpen(true);
  }

  function openEditGroup(group: ModifierGroup) {
    setEditingGroupId(group.id);
    setGroupName(group.name);
    setGroupRequired(group.required ? "Required" : "Optional");
    setGroupMax(String(group.maxChoices));
    setGroupOptions(group.options.length ? group.options.map((option) => ({ ...option })) : [emptyOption()]);
    setGroupError("");
    setGroupOpen(true);
  }

  function submitGroup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = groupOptions
      .map((option) => ({
        ...option,
        name: option.name.trim(),
        price: option.price.trim() || "0",
      }))
      .filter((option) => option.name);

    if (!groupName.trim()) {
      setGroupError("Give this group a name, like Sauces or Choose your size.");
      return;
    }
    if (!cleaned.length) {
      setGroupError("Add at least one option customers can pick.");
      return;
    }

    const payload = {
      name: groupName.trim(),
      required: groupRequired === "Required",
      maxChoices: Math.max(1, Number(groupMax) || 1),
      options: cleaned,
    };

    if (editingGroupId) {
      updateModifierGroup(editingGroupId, payload);
      setMessage(`${payload.name} updated.`);
    } else {
      addModifierGroup(payload);
      setMessage(`${payload.name} added to your modifier groups.`);
    }
    closeGroupModal();
  }

  async function handleImageFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Keep images under 8MB for local preview storage.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const stored = await fileToStoredImage(file);
      setImage(stored);
      setImageName(file.name);
    } catch {
      setError("Couldn’t process that image. Try another file.");
    } finally {
      setUploading(false);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addMenuItem({
      name: name.trim(),
      description: desc.trim() || "Fresh from the kitchen",
      price: price.trim(),
      prep: `${prep} min`,
      category: newCategory,
      available: true,
      popular: newCategory === "Popular",
      image,
    });
    setMessage(`${name.trim()} added to your menu · saved locally.`);
    closeModal();
  }

  return (
    <div className="space-y-6">
      <PageTitle
        eyebrow="Restaurant / Menu"
        title="Menu management"
        description="Keep item details accurate and toggle availability as your kitchen changes."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setManageOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-line bg-card px-3 text-left transition hover:border-ink/25 hover:bg-surface"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-ink text-lime">
                <Icons.menuBoard size={13} />
              </span>
              <span className="pr-1">
                <span className="block text-[12px] font-bold text-ink">Manage groups</span>
                <span className="block text-[10px] text-muted">
                  {modifiers.length ? `${modifiers.length} set up` : "Sizes & sauces"}
                </span>
              </span>
            </button>
            <Button onClick={() => setOpen(true)}>Add menu item +</Button>
          </div>
        }
      />

      {message ? <Notice>{message}</Notice> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Menu items" value={String(menu.length)} icon={<Icons.menuBoard size={14} />} />
        <StatCard
          label="Available today"
          value={String(menu.filter((item) => item.available).length)}
          icon={<Icons.check size={14} />}
        />
        <StatCard
          label="Sold out"
          value={String(menu.filter((item) => !item.available).length)}
          tone="orange"
          icon={<Icons.pause size={14} />}
        />
      </div>

      <Panel title="Your menu" description="Changes to availability apply immediately" action={<Search placeholder="Find a dish…" />}>
        <div className="border-b border-line px-5 py-4">
          <SelectPill options={categories} selected={category} onSelect={setCategory} />
        </div>

        <div className="divide-y divide-line">
          {visible.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface ring-1 ring-line">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center text-2xl">{categoryFallback(item.category)}</span>
                )}
              </div>
              <div className="min-w-[180px] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[13px] font-bold text-ink">{item.name}</h3>
                  {item.popular ? (
                    <span className="rounded-md bg-[#fff2df] px-1.5 py-0.5 text-[9px] font-bold text-[#9c672e]">
                      POPULAR
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 max-w-md text-[12px] leading-5 text-muted">{item.description}</p>
                <p className="mt-1 text-[11px] text-soft">
                  {item.category} · {item.prep} prep
                </p>
              </div>
              <p className="text-[13px] font-bold text-ink">
                {item.price} <span className="text-[10px] font-normal text-muted">local</span>
              </p>
              <Badge label={item.available ? "Active" : "Paused"} />
              <button
                aria-label={`Toggle availability for ${item.name}`}
                onClick={() => toggleMenuItem(item.id)}
                className={`relative h-6 w-11 rounded-full transition ${item.available ? "bg-ink" : "bg-line-strong"}`}
              >
                <span
                  className={`absolute top-1 size-4 rounded-full transition-all ${
                    item.available ? "left-6 bg-lime" : "left-1 bg-white"
                  }`}
                />
              </button>
              <button className="rounded-lg p-2 text-muted transition hover:bg-surface hover:text-ink" aria-label="More">
                <Icons.more size={16} />
              </button>
            </article>
          ))}
        </div>
        {!visible.length ? (
          <div className="p-12 text-center text-[13px] text-muted">No menu items in this category yet.</div>
        ) : null}
      </Panel>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close add menu item"
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
            onClick={closeModal}
          />

          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-menu-title"
            className="relative z-10 flex max-h-[min(92vh,880px)] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-card shadow-[0_32px_100px_rgba(17,17,17,0.28)] animate-fade-up sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-[linear-gradient(180deg,#fbfef4_0%,#ffffff_100%)] px-5 py-5 sm:px-7">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  New dish
                </p>
                <h2 id="add-menu-title" className="font-display mt-3 text-[24px] font-bold tracking-tight text-ink">
                  Add menu item
                </h2>
                <p className="mt-1 text-[13px] text-muted">Photo, pricing, and details — saved to this browser for now.</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-xl border border-line text-ink transition hover:bg-surface"
              >
                <Icons.close size={16} />
              </button>
            </div>

            <div className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
              {/* Compact image upload */}
              <div>
                <p className="text-[12px] font-bold text-ink">Dish photo</p>
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOver(false);
                    void handleImageFile(event.dataTransfer.files?.[0]);
                  }}
                  className={`mt-2 flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition ${
                    dragOver ? "border-ink bg-lime-soft" : "border-line bg-surface"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-card transition hover:border-ink/30"
                    aria-label={image ? "Replace dish photo" : "Upload dish photo"}
                  >
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="grid size-full place-items-center text-muted">
                        {uploading ? <Icons.clock size={16} /> : <Icons.image size={18} />}
                      </span>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">
                      {uploading
                        ? "Optimizing photo…"
                        : image
                          ? imageName || "Photo added"
                          : "Add a dish photo"}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted">Optional · JPG, PNG, WebP · saved locally</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-bold text-lime transition hover:bg-charcoal-soft"
                      >
                        <Icons.upload size={12} />
                        {image ? "Replace" : "Upload"}
                      </button>
                      {image ? (
                        <button
                          type="button"
                          onClick={() => {
                            setImage(undefined);
                            setImageName("");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-2.5 py-1.5 text-[11px] font-bold text-muted transition hover:text-ink"
                        >
                          <Icons.trash size={12} /> Remove
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => void handleImageFile(event.target.files?.[0])}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-[12px] font-bold text-ink sm:col-span-2">
                  Item name
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grilled chicken bowl"
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <label className="block text-[12px] font-bold text-ink">
                  Price · local currency
                  <input
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    inputMode="decimal"
                    placeholder="1,280"
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <SelectField
                  label="Category"
                  value={newCategory}
                  options={formCategories}
                  onChange={setNewCategory}
                />

                <label className="block text-[12px] font-bold text-ink sm:col-span-2">
                  Description
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    rows={3}
                    placeholder="Ingredients and what makes it special"
                    className="mt-2 w-full resize-none rounded-xl border border-line-strong bg-surface px-4 py-3 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <label className="block text-[12px] font-bold text-ink">
                  Prep time · minutes
                  <input
                    value={prep}
                    onChange={(e) => setPrep(e.target.value)}
                    type="number"
                    min="1"
                    className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                  />
                </label>

                <div className="rounded-xl border border-line bg-surface px-4 py-3">
                  <p className="text-[12px] font-bold text-ink">Local preview</p>
                  <p className="mt-1 text-[11px] leading-4 text-muted">
                    Photos are compressed and kept in browser storage until the backend is connected.
                  </p>
                </div>
              </div>

              {error ? <p className="rounded-xl border border-[#ffd7c2] bg-[#fff6ef] px-4 py-3 text-[12px] font-semibold text-[#98613d]">{error}</p> : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-card px-5 py-4 sm:px-7">
              <button type="button" onClick={closeModal} className="text-[12px] font-bold text-muted hover:text-ink">
                Cancel
              </button>
              <Button type="submit" disabled={uploading || !name.trim() || !price.trim()}>
                Save menu item
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {manageOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close modifier groups"
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
            onClick={() => setManageOpen(false)}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-groups-title"
            className="relative z-10 flex max-h-[min(92vh,820px)] w-full max-w-[640px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-card shadow-[0_32px_100px_rgba(17,17,17,0.28)] animate-fade-up sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-[linear-gradient(180deg,#fbfef4_0%,#ffffff_100%)] px-5 py-5 sm:px-7">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  Menu options
                </p>
                <h2 id="manage-groups-title" className="font-display mt-3 text-[24px] font-bold tracking-tight text-ink">
                  Modifier groups
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  Set up sizes, sauces, extras, and other choices for your dishes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManageOpen(false)}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-xl border border-line text-ink transition hover:bg-surface"
              >
                <Icons.close size={16} />
              </button>
            </div>

            <div className="sidebar-scroll flex-1 overflow-y-auto">
              <div className="divide-y divide-line">
                {modifiers.map((group) => (
                  <div key={group.id} className="flex items-start justify-between gap-3 px-5 py-4 sm:px-7">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-bold text-ink">{group.name}</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            group.required ? "bg-ink text-lime" : "bg-surface text-muted"
                          }`}
                        >
                          {group.required ? "Required" : "Optional"}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] leading-5 text-muted">
                        {formatModifierRule(group)} · {group.options.map((option) => option.name).join(" · ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openEditGroup(group)}
                      className="shrink-0 rounded-xl border border-line px-3 py-2 text-[12px] font-bold text-ink transition hover:bg-surface"
                    >
                      Edit
                    </button>
                  </div>
                ))}
                {!modifiers.length ? (
                  <div className="px-5 py-14 text-center sm:px-7">
                    <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-ink text-lime">
                      <Icons.menuBoard size={20} />
                    </div>
                    <p className="mt-4 text-[14px] font-bold text-ink">No groups yet</p>
                    <p className="mt-1 text-[12px] text-muted">Add sizes, sauces, or extras for your menu.</p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setManageOpen(false)}
                className="text-[12px] font-bold text-muted hover:text-ink"
              >
                Close
              </button>
              <Button
                onClick={() => {
                  openCreateGroup();
                }}
              >
                Add group +
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {groupOpen ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Close modifier group"
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={closeGroupModal}
          />

          <form
            onSubmit={submitGroup}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modifier-group-title"
            className="relative z-10 flex max-h-[min(92vh,820px)] w-full max-w-[560px] flex-col overflow-hidden rounded-t-[28px] border border-line bg-card shadow-[0_32px_100px_rgba(17,17,17,0.28)] animate-fade-up sm:rounded-[28px]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-line bg-[linear-gradient(180deg,#fbfef4_0%,#ffffff_100%)] px-5 py-5 sm:px-7">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-lime">
                  <span className="size-1.5 rounded-full bg-lime" />
                  {editingGroupId ? "Edit group" : "New group"}
                </p>
                <h2 id="modifier-group-title" className="font-display mt-3 text-[24px] font-bold tracking-tight text-ink">
                  {editingGroupId ? "Edit modifier group" : "Add modifier group"}
                </h2>
                <p className="mt-1 text-[13px] text-muted">
                  For sizes, sauces, extras, and other choices customers pick with a dish.
                </p>
              </div>
              <button
                type="button"
                onClick={closeGroupModal}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-xl border border-line text-ink transition hover:bg-surface"
              >
                <Icons.close size={16} />
              </button>
            </div>

            <div className="sidebar-scroll flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-7">
              <label className="block text-[12px] font-bold text-ink">
                Group name
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Sauces, Choose your size, Add extras"
                  className="mt-2 h-12 w-full rounded-xl border border-line-strong bg-surface px-4 text-[13px] font-normal outline-none transition focus:border-ink focus:bg-card"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  label="Selection rule"
                  value={groupRequired}
                  options={["Optional", "Required"]}
                  onChange={setGroupRequired}
                />
                <SelectField
                  label="Max choices"
                  value={groupMax}
                  options={["1", "2", "3", "4", "5"]}
                  onChange={setGroupMax}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12px] font-bold text-ink">Options</p>
                    <p className="mt-0.5 text-[11px] text-muted">Each choice customers can add · price can be 0</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setGroupOptions((current) => [...current, emptyOption()])}
                    className="text-[12px] font-bold text-ink hover:underline"
                  >
                    Add option +
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {groupOptions.map((option, index) => (
                    <div key={option.id} className="grid grid-cols-[1fr_110px_40px] gap-2">
                      <input
                        value={option.name}
                        onChange={(e) =>
                          setGroupOptions((current) =>
                            current.map((item, i) => (i === index ? { ...item, name: e.target.value } : item)),
                          )
                        }
                        placeholder={index === 0 ? "e.g. Garlic sauce" : "Option name"}
                        className="h-11 rounded-xl border border-line-strong bg-surface px-3 text-[13px] outline-none transition focus:border-ink focus:bg-card"
                      />
                      <input
                        value={option.price}
                        onChange={(e) =>
                          setGroupOptions((current) =>
                            current.map((item, i) => (i === index ? { ...item, price: e.target.value } : item)),
                          )
                        }
                        inputMode="decimal"
                        placeholder="Price"
                        className="h-11 rounded-xl border border-line-strong bg-surface px-3 text-[13px] outline-none transition focus:border-ink focus:bg-card"
                      />
                      <button
                        type="button"
                        aria-label="Remove option"
                        disabled={groupOptions.length <= 1}
                        onClick={() =>
                          setGroupOptions((current) => current.filter((_, i) => i !== index))
                        }
                        className="grid size-11 place-items-center rounded-xl border border-line text-muted transition hover:bg-surface hover:text-ink disabled:opacity-40"
                      >
                        <Icons.trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {groupError ? (
                <p className="rounded-xl border border-[#ffd7c2] bg-[#fff6ef] px-4 py-3 text-[12px] font-semibold text-[#98613d]">
                  {groupError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-4 sm:px-7">
              {editingGroupId ? (
                <button
                  type="button"
                  onClick={() => {
                    deleteModifierGroup(editingGroupId);
                    setMessage("Modifier group removed.");
                    closeGroupModal();
                  }}
                  className="text-[12px] font-bold text-red hover:underline"
                >
                  Delete group
                </button>
              ) : (
                <button type="button" onClick={closeGroupModal} className="text-[12px] font-bold text-muted hover:text-ink">
                  Cancel
                </button>
              )}
              <div className="flex gap-2">
                {editingGroupId ? (
                  <Button type="button" variant="secondary" onClick={closeGroupModal}>
                    Cancel
                  </Button>
                ) : null}
                <Button type="submit">{editingGroupId ? "Save group" : "Add group"}</Button>
              </div>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
