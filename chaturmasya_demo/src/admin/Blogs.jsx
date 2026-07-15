import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/firebase";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";

import mammoth from "mammoth";

/* ============================================================
   CONSTANTS
============================================================ */

const PHASES = [
  { value: "before", label: "Before Chaturmasya", short: "Before", tone: "bg-amber-100 text-amber-800 border-amber-200" },
  { value: "during", label: "During Chaturmasya", short: "During", tone: "bg-rose-100 text-rose-800 border-rose-200" },
  { value: "legacy", label: "Legacy", short: "Legacy", tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
];

const phaseMeta = (value) => PHASES.find((p) => p.value === value) || PHASES[0];

const CATEGORY_OPTIONS = {
  before: [
    "Spiritual Insights", "History & Heritage", "Guru Parampara",
    "About Chaturmasya", "Community", "Seva", "Visitor Guide", "Other",
  ],
  during: [
    "Daily Highlights", "Pravachana", "Ritual of the Day", "Seva Spotlight",
    "Volunteer Story", "Devotee Experience", "Children's Corner", "Photo Story", "Other",
  ],
  legacy: [
    "Chaturmasya in Numbers", "Memorable Moments", "Devotee Messages",
    "Gallery", "Media Coverage", "Acknowledgements", "Souvenir", "Other",
  ],
};

const createEmptySection = () => ({
  id: `${Date.now()}-${Math.random()}`,
  heading: "",
  content: "",
  existingImages: [],
  newImages: [],
  video: "",
});

const getInitialFormData = () => ({
  phase: "before",
  category: "",
  customCategory: "",
  title: "",
  description: "",
  day: "",
  coverMediaType: "image",
  coverImageFile: null,
  coverImagePreview: "",
  existingCoverImage: "",
  coverVideo: "",
  sections: [createEmptySection()],
  footer: "Jai Jnaneshwari",
});

/* ============================================================
   RICH TEXT EDITOR
============================================================ */

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit, Underline, TextStyle, Color],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) editor.commands.setContent(value || "");
  }, [value, editor]);

  if (!editor) return null;

  const btn = (active = false, extra = "") =>
    `min-w-[36px] h-9 px-2 rounded-lg text-sm font-semibold transition ${extra} ${
      active
        ? "bg-stone-900 text-white shadow-sm"
        : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
    }`;

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">
      <div className="flex flex-wrap items-center gap-1.5 p-2 bg-stone-50/80 border-b border-stone-200 sticky top-0 z-10">
        <button type="button" title="Undo" onClick={() => editor.chain().focus().undo().run()} className={btn()}>↶</button>
        <button type="button" title="Redo" onClick={() => editor.chain().focus().redo().run()} className={btn()}>↷</button>
        <span className="w-px h-6 bg-stone-300 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={btn(editor.isActive("paragraph"))}>P</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
        <span className="w-px h-6 bg-stone-300 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"), "font-bold")}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"), "italic")}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"), "underline")}>U</button>
        <span className="w-px h-6 bg-stone-300 mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1. List</button>
        <span className="w-px h-6 bg-stone-300 mx-1" />
        <label title="Font Color" className="h-9 px-2.5 flex items-center gap-2 bg-white border border-stone-200 rounded-lg cursor-pointer text-xs font-semibold text-stone-600">
          <span>A</span>
          <input type="color" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} className="w-5 h-5 cursor-pointer bg-transparent border-0 p-0" />
        </label>
        <div className="flex gap-0.5 ml-auto">
          {["🙏", "🌺", "🪔", "🕉️", "✨", "🌸"].map((emoji) => (
            <button key={emoji} type="button" onClick={() => editor.chain().focus().insertContent(emoji).run()} className="w-9 h-9 rounded-lg hover:bg-stone-200 transition">
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-stone max-w-none min-h-[220px] p-5 focus-within:outline-none
          [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror]:outline-none
          [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6
          [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6"
      />
    </div>
  );
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all | published | draft
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | az
  const [view, setView] = useState("grid"); // grid | list

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const importInputRef = useRef(null);

  /* ---------- FIRESTORE ---------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "blogs"),
      (snapshot) => {
        const data = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setBlogs(data);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  /* ---------- STATS ---------- */
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.published).length;
    return {
      total,
      published,
      drafts: total - published,
      before: blogs.filter((b) => b.phase === "before").length,
      during: blogs.filter((b) => b.phase === "during").length,
      legacy: blogs.filter((b) => b.phase === "legacy").length,
    };
  }, [blogs]);

  /* ---------- FILTER + SORT ---------- */
  const filteredBlogs = useMemo(() => {
    const s = search.toLowerCase();
    let out = blogs.filter((blog) => {
      const matchSearch =
        !s ||
        blog.title?.toLowerCase().includes(s) ||
        blog.description?.toLowerCase().includes(s) ||
        blog.category?.toLowerCase().includes(s);
      const matchPhase = phaseFilter === "all" || blog.phase === phaseFilter;
      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "published" && blog.published) ||
        (statusFilter === "draft" && !blog.published);
      return matchSearch && matchPhase && matchStatus;
    });

    out.sort((a, b) => {
      if (sortBy === "az") return (a.title || "").localeCompare(b.title || "");
      const aT = a.createdAt?.toDate?.()?.getTime() || 0;
      const bT = b.createdAt?.toDate?.()?.getTime() || 0;
      return sortBy === "oldest" ? aT - bT : bT - aT;
    });

    return out;
  }, [blogs, search, phaseFilter, statusFilter, sortBy]);

  /* ---------- HANDLERS ---------- */
  const handleChange = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handlePhaseChange = (phase) =>
    setFormData((p) => ({
      ...p, phase, category: "", customCategory: "",
      day: phase === "during" ? p.day : "",
    }));

  const handleCoverImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFormData((p) => ({
      ...p, coverImageFile: file, coverImagePreview: URL.createObjectURL(file),
    }));
  };

  const addSection = () =>
    setFormData((p) => ({ ...p, sections: [...p.sections, createEmptySection()] }));

  const updateSection = (index, field, value) =>
    setFormData((p) => {
      const sections = [...p.sections];
      sections[index] = { ...sections[index], [field]: value };
      return { ...p, sections };
    });

  const removeSection = (index) =>
    setFormData((p) => ({
      ...p,
      sections: p.sections.length === 1
        ? [createEmptySection()]
        : p.sections.filter((_, i) => i !== index),
    }));

  const handleSectionImages = (sectionIndex, event) => {
    const files = Array.from(event.target.files || []);
    const newImages = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setFormData((p) => {
      const sections = [...p.sections];
      sections[sectionIndex] = {
        ...sections[sectionIndex],
        newImages: [...(sections[sectionIndex].newImages || []), ...newImages],
      };
      return { ...p, sections };
    });
    event.target.value = "";
  };

  const removeNewImage = (sectionIndex, imageIndex) =>
    setFormData((p) => {
      const sections = [...p.sections];
      sections[sectionIndex].newImages = sections[sectionIndex].newImages.filter((_, i) => i !== imageIndex);
      return { ...p, sections };
    });

  const removeExistingImage = (sectionIndex, imageIndex) =>
    setFormData((p) => {
      const sections = [...p.sections];
      sections[sectionIndex].existingImages = sections[sectionIndex].existingImages.filter((_, i) => i !== imageIndex);
      return { ...p, sections };
    });

  /* ---------- UPLOAD ---------- */
  const uploadFile = async (file, folder) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}_${safeName}`;
    const fileRef = ref(storage, `${folder}/${fileName}`);
    await uploadBytes(fileRef, file);
    return await getDownloadURL(fileRef);
  };

  /* ---------- DOCX IMPORT (unchanged logic) ---------- */
  const handleBlogTemplateImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      alert("Please upload the predefined .docx template.");
      return;
    }
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;
      const parser = new DOMParser();
      const documentNode = parser.parseFromString(html, "text/html");
      const plainText = documentNode.body.innerText;

      const extractField = (startLabel, endLabel) => {
        const startIndex = plainText.indexOf(startLabel);
        if (startIndex === -1) return "";
        const contentStart = startIndex + startLabel.length;
        const endIndex = endLabel ? plainText.indexOf(endLabel, contentStart) : plainText.length;
        return plainText.slice(contentStart, endIndex === -1 ? plainText.length : endIndex).trim();
      };

      const phaseText = extractField("PHASE:", "CATEGORY:");
      const category = extractField("CATEGORY:", "DAY:");
      const day = extractField("DAY:", "TITLE:");
      const title = extractField("TITLE:", "SHORT DESCRIPTION:");
      const description = extractField("SHORT DESCRIPTION:", "ARTICLE CONTENT:");
      const footer = extractField("FOOTER:", null);

      let phase = "before";
      const np = phaseText.toLowerCase();
      if (np.includes("during")) phase = "during";
      else if (np.includes("legacy")) phase = "legacy";

      const articleLabel = Array.from(documentNode.body.querySelectorAll("p, h1, h2, h3"))
        .find((el) => el.textContent.trim().startsWith("ARTICLE CONTENT:"));

      let articleHtml = "";
      if (articleLabel) {
        let el = articleLabel.nextElementSibling;
        while (el) {
          if (el.textContent.trim().startsWith("FOOTER:")) break;
          articleHtml += el.outerHTML;
          el = el.nextElementSibling;
        }
      }

      const availableCategories = CATEGORY_OPTIONS[phase];
      const categoryExists = availableCategories.includes(category);

      setFormData((p) => ({
        ...p, phase,
        category: categoryExists ? category : "Other",
        customCategory: categoryExists ? "" : category,
        day: phase === "during" ? day.replace(/\D/g, "") : "",
        title, description,
        sections: [{ ...createEmptySection(), content: articleHtml }],
        footer: footer || "Jai Jnaneshwari",
      }));
      setEditingId(null);
      setIsFormOpen(true);
      alert("Blog template imported successfully. Please review before publishing.");
    } catch (error) {
      console.error("DOCX import error:", error);
      alert("Unable to import this document. Please use the predefined blog template.");
    }
    event.target.value = "";
  };

  /* ---------- SAVE / EDIT / DELETE ---------- */
  const resetForm = () => {
    setFormData(getInitialFormData());
    setEditingId(null);
    setIsFormOpen(false);
  };

  const saveBlog = async (published) => {
    if (!formData.title.trim()) return alert("Please enter the article title.");
    if (!formData.description.trim()) return alert("Please enter the short description.");
    if (!formData.category) return alert("Please select a category.");

    try {
      setSaving(true);
      let coverUrl = formData.existingCoverImage || "";
      if (formData.coverImageFile) coverUrl = await uploadFile(formData.coverImageFile, "blogs/covers");

      const processedSections = [];
      for (const section of formData.sections) {
        const uploadedImages = [];
        for (const image of section.newImages || []) {
          const url = await uploadFile(image.file, "blogs/sections");
          uploadedImages.push(url);
        }
        const images = [...(section.existingImages || []), ...uploadedImages];
        if (section.heading || section.content || section.video || images.length) {
          processedSections.push({
            id: section.id,
            heading: section.heading || "",
            content: section.content || "",
            images,
            video: section.video || "",
          });
        }
      }

      const finalCategory = formData.category === "Other" ? formData.customCategory.trim() : formData.category;

      const blogData = {
        phase: formData.phase,
        category: finalCategory,
        day: formData.phase === "during" ? Number(formData.day) || null : null,
        title: formData.title.trim(),
        description: formData.description.trim(),
        coverMedia: {
          type: formData.coverMediaType,
          url: formData.coverMediaType === "image" ? coverUrl : formData.coverVideo,
        },
        image: formData.coverMediaType === "image" ? coverUrl : "",
        sections: processedSections,
        footer: formData.footer || "Jai Jnaneshwari",
        published,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "blogs", editingId), blogData);
      } else {
        await addDoc(collection(db, "blogs"), { ...blogData, createdAt: serverTimestamp() });
      }

      alert(published ? "Chronicle published successfully." : "Chronicle saved as draft.");
      resetForm();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving the chronicle.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (blog) => {
    const categories = CATEGORY_OPTIONS[blog.phase] || [];
    const categoryExists = categories.includes(blog.category);

    setFormData({
      phase: blog.phase || "before",
      category: categoryExists ? blog.category : "Other",
      customCategory: categoryExists ? "" : blog.category || "",
      title: blog.title || "",
      description: blog.description || "",
      day: blog.day || "",
      coverMediaType: blog.coverMedia?.type || "image",
      coverImageFile: null,
      coverImagePreview: "",
      existingCoverImage: blog.coverMedia?.type === "image" ? blog.coverMedia.url : "",
      coverVideo: blog.coverMedia?.type === "video" ? blog.coverMedia.url : "",
      sections: blog.sections?.length
        ? blog.sections.map((s) => ({
            id: s.id || `${Date.now()}-${Math.random()}`,
            heading: s.heading || "",
            content: s.content || s.description || "",
            existingImages: s.images || [],
            newImages: [],
            video: s.video || "",
          }))
        : [createEmptySection()],
      footer: blog.footer || "Jai Jnaneshwari",
    });

    setEditingId(blog.id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (blog) => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return;
    try {
      await deleteDoc(doc(db, "blogs", blog.id));
    } catch (error) {
      console.error(error);
      alert("Unable to delete blog.");
    }
  };

  const togglePublish = async (blog) =>
    await updateDoc(doc(db, "blogs", blog.id), {
      published: !blog.published,
      updatedAt: serverTimestamp(),
    });

  /* ============================================================
     RENDER
  ============================================================ */

  const hasFilters = search || phaseFilter !== "all" || statusFilter !== "all";

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ============ TOP BAR ============ */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <nav className="flex text-stone-400 text-[11px] font-bold uppercase tracking-widest">
                <Link to="/admin" className="hover:text-orange-600">Admin</Link>
                <span className="mx-2">/</span>
                <span className="text-stone-700 truncate">Mutt Chronicles</span>
              </nav>
              <h1 className="mt-1 truncate text-xl sm:text-2xl md:text-3xl font-serif font-black text-stone-900">
                Mutt Chronicles
              </h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!isFormOpen && (
                <button
                  type="button"
                  onClick={() => importInputRef.current?.click()}
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-semibold text-stone-700 hover:border-orange-500 hover:text-orange-700 transition"
                  title="Import from DOCX"
                >
                  ↑ Import
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (isFormOpen) resetForm();
                  else {
                    setFormData(getInitialFormData());
                    setEditingId(null);
                    setIsFormOpen(true);
                  }
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 sm:px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm shadow-orange-600/20"
              >
                {isFormOpen ? "✕ Close" : "✍️ New Chronicle"}
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept=".docx"
                onChange={handleBlogTemplateImport}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* ============ STATS ============ */}
        {!isFormOpen && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatCard label="Total" value={stats.total} tone="stone" />
            <StatCard label="Published" value={stats.published} tone="emerald" />
            <StatCard label="Drafts" value={stats.drafts} tone="amber" />
            <StatCard label="Before" value={stats.before} tone="amber" muted />
            <StatCard label="During" value={stats.during} tone="rose" muted />
            <StatCard label="Legacy" value={stats.legacy} tone="emerald" muted />
          </div>
        )}

        {/* ============ TEMPLATE IMPORT BANNER (mobile only, action already in top bar) ============ */}
        {!isFormOpen && (
          <div className="sm:hidden bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
            <p className="text-sm font-semibold text-stone-900">Import from Word template</p>
            <p className="text-xs text-stone-600 mt-1 mb-3">Download the template, fill it in and upload here.</p>
            <div className="flex flex-col gap-2">
              <a
                href={`${process.env.PUBLIC_URL}/templates/Chaturmasya_Blog_Template.docx`}
                download="Chaturmasya_Blog_Template.docx"
                className="px-4 py-2.5 bg-white border border-stone-300 rounded-lg text-xs font-bold text-stone-700 text-center"
              >
                ↓ Download Template
              </a>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="px-4 py-2.5 bg-orange-600 text-white rounded-lg text-xs font-bold"
              >
                ↑ Upload DOCX
              </button>
            </div>
          </div>
        )}

        {/* Desktop template banner */}
        {!isFormOpen && (
          <div className="hidden sm:flex items-center justify-between gap-5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-5 mb-6">
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-lg text-stone-900">Import Blog from Template</h3>
              <p className="text-sm text-stone-600 mt-0.5">Download the predefined Word template, prepare the article and upload.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a
                href={`${process.env.PUBLIC_URL}/templates/Chaturmasya_Blog_Template.docx`}
                download="Chaturmasya_Blog_Template.docx"
                className="px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm font-semibold text-stone-700 hover:border-orange-500 transition"
              >
                ↓ Download
              </a>
            </div>
          </div>
        )}

        {/* ============ EDITOR ============ */}
        {isFormOpen && (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-6">
            {/* SIDEBAR */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="bg-white border border-stone-200 rounded-2xl p-4">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-3">Editor Steps</p>
                <ol className="space-y-1">
                  {[
                    { n: "01", label: "Article Info", href: "#s-info" },
                    { n: "02", label: "Cover Media", href: "#s-cover" },
                    { n: "03", label: "Content", href: "#s-content" },
                    { n: "04", label: "Footer", href: "#s-footer" },
                  ].map((s) => (
                    <li key={s.n}>
                      <a
                        href={s.href}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-700 hover:bg-stone-100 font-medium"
                      >
                        <span className="text-xs font-mono text-orange-600">{s.n}</span>
                        <span>{s.label}</span>
                      </a>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 pt-4 border-t border-stone-200 space-y-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveBlog(false)}
                    className="w-full border border-stone-300 hover:border-stone-400 px-4 py-2.5 rounded-xl font-semibold text-sm text-stone-700 disabled:opacity-50"
                  >
                    Save Draft
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => saveBlog(true)}
                    className="w-full bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-50 shadow-sm shadow-orange-600/20"
                  >
                    {saving ? "Saving…" : editingId ? "Update & Publish" : "Publish"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800"
                  >
                    Discard changes
                  </button>
                </div>
              </div>
            </aside>

            {/* FORM */}
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-stone-900 to-stone-800 px-5 sm:px-8 py-5">
                <p className="text-orange-400 text-[11px] uppercase font-bold tracking-widest">Chronicle Editor</p>
                <h2 className="text-white font-serif text-lg sm:text-xl font-bold mt-0.5">
                  {editingId ? "Edit Chronicle" : "Create New Chronicle"}
                </h2>
              </div>

              <div className="p-5 sm:p-8 space-y-10">
                {/* 01 INFO */}
                <EditorSection id="s-info" number="01" title="Article Information">
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Phase">
                      <select value={formData.phase} onChange={(e) => handlePhaseChange(e.target.value)} className={inputClass}>
                        {PHASES.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                      </select>
                    </Field>
                    <Field label="Category">
                      <select value={formData.category} onChange={(e) => handleChange("category", e.target.value)} className={inputClass}>
                        <option value="">Select Category</option>
                        {CATEGORY_OPTIONS[formData.phase].map((c) => (<option key={c} value={c}>{c}</option>))}
                      </select>
                    </Field>
                  </div>

                  {formData.category === "Other" && (
                    <div className="mt-5">
                      <Field label="Custom Category">
                        <input value={formData.customCategory} onChange={(e) => handleChange("customCategory", e.target.value)} className={inputClass} />
                      </Field>
                    </div>
                  )}

                  {formData.phase === "during" && (
                    <div className="mt-5 max-w-xs">
                      <Field label="Day Number">
                        <input type="number" min="1" max="60" value={formData.day} onChange={(e) => handleChange("day", e.target.value)} className={inputClass} />
                      </Field>
                    </div>
                  )}

                  <div className="mt-5">
                    <Field label="Article Title">
                      <input value={formData.title} onChange={(e) => handleChange("title", e.target.value)} className={inputClass} placeholder="Enter article title..." />
                    </Field>
                  </div>

                  <div className="mt-5">
                    <Field label="Short Description">
                      <textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} rows="4" className={`${inputClass} resize-none`} placeholder="Displayed on the blog card..." />
                    </Field>
                  </div>
                </EditorSection>

                {/* 02 COVER */}
                <EditorSection id="s-cover" number="02" title="Cover Media">
                  <div className="inline-flex p-1 bg-stone-100 rounded-xl mb-5">
                    <button type="button" onClick={() => handleChange("coverMediaType", "image")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${formData.coverMediaType === "image" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"}`}>
                      📷 Photo
                    </button>
                    <button type="button" onClick={() => handleChange("coverMediaType", "video")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${formData.coverMediaType === "video" ? "bg-white shadow-sm text-stone-900" : "text-stone-500"}`}>
                      ▶ Video
                    </button>
                  </div>

                  {formData.coverMediaType === "image" ? (
                    <div>
                      {(formData.coverImagePreview || formData.existingCoverImage) ? (
                        <div className="relative max-w-2xl">
                          <img
                            src={formData.coverImagePreview || formData.existingCoverImage}
                            alt="Cover"
                            className="w-full aspect-video object-cover rounded-2xl border border-stone-200"
                          />
                          <label className="absolute bottom-3 right-3 bg-black/70 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-lg cursor-pointer backdrop-blur">
                            Replace
                            <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                          </label>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center max-w-2xl aspect-video border-2 border-dashed border-stone-300 hover:border-orange-500 rounded-2xl cursor-pointer transition bg-stone-50/50">
                          <span className="text-3xl">📷</span>
                          <span className="mt-2 font-semibold text-stone-700">Select cover photo</span>
                          <span className="text-xs text-stone-500 mt-1">JPG / PNG · 16:9 recommended</span>
                          <input type="file" accept="image/*" onChange={handleCoverImageChange} className="hidden" />
                        </label>
                      )}
                    </div>
                  ) : (
                    <Field label="Video URL">
                      <input type="url" value={formData.coverVideo} onChange={(e) => handleChange("coverVideo", e.target.value)} className={inputClass} placeholder="YouTube URL..." />
                    </Field>
                  )}
                </EditorSection>

                {/* 03 CONTENT */}
                <EditorSection id="s-content" number="03" title="Article Content">
                  <div className="space-y-6">
                    {formData.sections.map((section, i) => (
                      <div key={section.id} className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/30">
                        <div className="bg-white border-b border-stone-200 px-4 py-3 flex justify-between items-center">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-stone-800">
                            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold grid place-items-center">
                              {i + 1}
                            </span>
                            Section {i + 1}
                          </span>
                          {formData.sections.length > 1 && (
                            <button type="button" onClick={() => removeSection(i)} className="text-red-500 hover:text-red-700 text-xs font-bold">
                              Remove
                            </button>
                          )}
                        </div>

                        <div className="p-4 sm:p-5 space-y-5">
                          <Field label="Section Heading">
                            <input value={section.heading} onChange={(e) => updateSection(i, "heading", e.target.value)} className={inputClass} />
                          </Field>

                          <Field label="Content">
                            <RichTextEditor value={section.content} onChange={(html) => updateSection(i, "content", html)} />
                          </Field>

                          <div>
                            <label className="block font-bold text-xs text-stone-500 uppercase tracking-wide mb-3">Photos</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {section.existingImages.map((image, idx) => (
                                <ImagePreview key={image} src={image} onRemove={() => removeExistingImage(i, idx)} />
                              ))}
                              {section.newImages.map((image, idx) => (
                                <ImagePreview key={image.preview} src={image.preview} onRemove={() => removeNewImage(i, idx)} />
                              ))}
                              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-orange-500 rounded-xl cursor-pointer text-stone-500 hover:text-orange-600 transition text-sm font-semibold">
                                <span className="text-2xl">＋</span>
                                <span className="mt-1 text-xs">Add photos</span>
                                <input type="file" multiple accept="image/*" onChange={(e) => handleSectionImages(i, e)} className="hidden" />
                              </label>
                            </div>
                          </div>

                          <Field label="Video URL (Optional)">
                            <input type="url" value={section.video} onChange={(e) => updateSection(i, "video", e.target.value)} className={inputClass} />
                          </Field>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={addSection} className="w-full mt-5 border-2 border-dashed border-stone-300 hover:border-orange-500 hover:bg-orange-50/30 rounded-2xl py-4 font-semibold text-stone-600 hover:text-orange-700 transition">
                    ＋ Add Another Section
                  </button>
                </EditorSection>

                {/* 04 FOOTER */}
                <EditorSection id="s-footer" number="04" title="Footer">
                  <Field label="Footer Message">
                    <input value={formData.footer} onChange={(e) => handleChange("footer", e.target.value)} className={inputClass} />
                  </Field>
                </EditorSection>

                {/* MOBILE ACTION BAR */}
                <div className="lg:hidden flex flex-col sm:flex-row justify-end gap-3 border-t border-stone-200 pt-6">
                  <button type="button" disabled={saving} onClick={() => saveBlog(false)}
                    className="border border-stone-300 px-6 py-3 rounded-xl font-semibold text-stone-700 disabled:opacity-50">
                    Save Draft
                  </button>
                  <button type="button" disabled={saving} onClick={() => saveBlog(true)}
                    className="bg-gradient-to-br from-orange-600 to-orange-700 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50">
                    {saving ? "Saving…" : editingId ? "Update & Publish" : "Publish Chronicle"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============ LIST / FILTERS ============ */}
        {!isFormOpen && (
          <>
            <div className="bg-white border border-stone-200 rounded-2xl p-3 sm:p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">🔍</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chronicles by title, description, category..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3 py-3 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm"
                  />
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <select value={phaseFilter} onChange={(e) => setPhaseFilter(e.target.value)} className={filterSelectClass}>
                    <option value="all">All Phases</option>
                    {PHASES.map((p) => (<option key={p.value} value={p.value}>{p.label}</option>))}
                  </select>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={filterSelectClass}>
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Drafts</option>
                  </select>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={filterSelectClass}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="az">A–Z</option>
                  </select>
                  <div className="hidden sm:inline-flex p-1 bg-stone-100 rounded-lg">
                    <button onClick={() => setView("grid")} className={`px-2.5 py-1.5 rounded-md text-xs font-bold ${view === "grid" ? "bg-white shadow-sm" : "text-stone-500"}`}>▦</button>
                    <button onClick={() => setView("list")} className={`px-2.5 py-1.5 rounded-md text-xs font-bold ${view === "list" ? "bg-white shadow-sm" : "text-stone-500"}`}>☰</button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 text-xs">
                <p className="text-stone-500">
                  Showing <span className="font-bold text-stone-800">{filteredBlogs.length}</span> of{" "}
                  <span className="font-bold text-stone-800">{blogs.length}</span> chronicles
                </p>
                {hasFilters && (
                  <button
                    onClick={() => { setSearch(""); setPhaseFilter("all"); setStatusFilter("all"); }}
                    className="font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* LIST */}
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden animate-pulse">
                    <div className="aspect-video bg-stone-100" />
                    <div className="p-5 space-y-3">
                      <div className="h-3 bg-stone-100 rounded w-1/3" />
                      <div className="h-5 bg-stone-100 rounded w-3/4" />
                      <div className="h-3 bg-stone-100 rounded" />
                      <div className="h-3 bg-stone-100 rounded w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="bg-white border border-dashed border-stone-300 rounded-2xl py-16 text-center">
                <div className="text-4xl mb-3">📜</div>
                <h3 className="font-serif text-xl font-bold text-stone-800">No chronicles found</h3>
                <p className="text-sm text-stone-500 mt-1">
                  {hasFilters ? "Try adjusting your filters." : "Create your first chronicle to get started."}
                </p>
              </div>
            ) : view === "grid" ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBlogs.map((blog) => (
                  <BlogCard
                    key={blog.id}
                    blog={blog}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublish={togglePublish}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
                {filteredBlogs.map((blog) => (
                  <BlogRow
                    key={blog.id}
                    blog={blog}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublish={togglePublish}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   SMALL COMPONENTS
============================================================ */

const inputClass =
  "w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm transition";

const filterSelectClass =
  "bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-700 outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest mb-2">
      {label}
    </label>
    {children}
  </div>
);

const EditorSection = ({ id, number, title, children }) => (
  <section id={id} className="scroll-mt-28">
    <div className="flex items-center gap-3 mb-5">
      <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-mono text-sm font-bold">
        {number}
      </span>
      <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900">{title}</h2>
      <div className="h-px bg-stone-200 flex-1" />
    </div>
    {children}
  </section>
);

const ImagePreview = ({ src, onRemove }) => (
  <div className="relative aspect-square group">
    <img src={src} alt="" className="w-full h-full object-cover rounded-xl border border-stone-200" />
    <button
      type="button"
      onClick={onRemove}
      className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-red-600 text-white rounded-full w-7 h-7 grid place-items-center text-xs opacity-0 group-hover:opacity-100 transition"
    >
      ✕
    </button>
  </div>
);

const StatCard = ({ label, value, tone = "stone", muted = false }) => {
  const tones = {
    stone: "bg-stone-100 text-stone-700",
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    rose: "bg-rose-100 text-rose-700",
  };
  return (
    <div className={`rounded-2xl p-4 border border-stone-200 bg-white ${muted ? "" : "shadow-sm"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">{label}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tones[tone]}`}>·</span>
      </div>
      <p className="mt-2 text-2xl font-serif font-black text-stone-900">{value}</p>
    </div>
  );
};

const BlogCard = ({ blog, onEdit, onDelete, onTogglePublish }) => {
  const meta = phaseMeta(blog.phase);
  return (
    <article className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="relative aspect-video bg-stone-100 overflow-hidden">
        {blog.image ? (
          <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        ) : (
          <div className="w-full h-full grid place-items-center text-4xl text-stone-300">📜</div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${meta.tone}`}>
            {meta.short}{blog.phase === "during" && blog.day ? ` · D${blog.day}` : ""}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${blog.published ? "bg-emerald-500 text-white" : "bg-stone-800/80 text-white"}`}>
            {blog.published ? "● Live" : "○ Draft"}
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="text-[11px] font-bold text-orange-600 uppercase tracking-widest">{blog.category}</p>
        <h3 className="font-serif font-bold text-lg text-stone-900 mt-1 line-clamp-2 leading-snug">{blog.title}</h3>
        <p className="text-sm text-stone-500 line-clamp-2 mt-2">{blog.description}</p>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-stone-100">
          <button
            onClick={() => onTogglePublish(blog)}
            className={`text-xs font-bold py-2 rounded-lg transition ${blog.published ? "bg-stone-100 text-stone-700 hover:bg-stone-200" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
          >
            {blog.published ? "Hide" : "Publish"}
          </button>
          <button
            onClick={() => onEdit(blog)}
            className="text-xs font-bold py-2 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(blog)}
            className="text-xs font-bold py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

const BlogRow = ({ blog, onEdit, onDelete, onTogglePublish }) => {
  const meta = phaseMeta(blog.phase);
  return (
    <div className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 p-3 sm:p-4 hover:bg-stone-50 transition">
      <div className="aspect-video w-20 bg-stone-100 rounded-lg overflow-hidden shrink-0">
        {blog.image ? (
          <img src={blog.image} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-stone-300">📜</div>
        )}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${meta.tone}`}>
            {meta.short}{blog.phase === "during" && blog.day ? ` · D${blog.day}` : ""}
          </span>
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{blog.category}</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${blog.published ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-600"}`}>
            {blog.published ? "Live" : "Draft"}
          </span>
        </div>
        <h3 className="font-serif font-bold text-stone-900 truncate">{blog.title}</h3>
        <p className="text-xs text-stone-500 truncate">{blog.description}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onTogglePublish(blog)} className="text-xs font-bold px-3 py-2 rounded-lg hover:bg-stone-100">
          {blog.published ? "Hide" : "Publish"}
        </button>
        <button onClick={() => onEdit(blog)} className="text-xs font-bold px-3 py-2 rounded-lg text-orange-700 hover:bg-orange-50">Edit</button>
        <button onClick={() => onDelete(blog)} className="text-xs font-bold px-3 py-2 rounded-lg text-red-600 hover:bg-red-50">Delete</button>
      </div>
    </div>
  );
};

export default Blogs;
