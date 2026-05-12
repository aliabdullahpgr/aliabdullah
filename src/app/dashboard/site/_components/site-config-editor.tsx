"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

interface ConfigField {
  key: string;
  label: string;
  type: "text" | "textarea";
  description?: string;
}

interface ConfigSection {
  id: string;
  label: string;
  fields: ConfigField[];
}

const configSections: ConfigSection[] = [
  {
    id: "hero",
    label: "Hero",
    fields: [
      { key: "hero.tagline", label: "Tagline", type: "textarea" },
      { key: "hero.taglineEmphasis", label: "Emphasis word", type: "text" },
    ],
  },
  {
    id: "about",
    label: "About",
    fields: [
      { key: "about.name", label: "Name", type: "text" },
      { key: "about.role", label: "Role", type: "text" },
      { key: "about.location", label: "Location", type: "text" },
      { key: "about.company", label: "Current company", type: "text" },
      { key: "about.university", label: "University", type: "text" },
      { key: "about.bio2", label: "Bio", type: "textarea" },
      {
        key: "about.skills",
        label: "Skills",
        type: "text",
        description: "Comma separated",
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    fields: [
      { key: "contact.email", label: "Email", type: "text" },
      { key: "contact.github", label: "GitHub URL", type: "text" },
      { key: "contact.linkedin", label: "LinkedIn URL", type: "text" },
      { key: "contact.location", label: "Location display", type: "text" },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    fields: [
      { key: "footer.availability", label: "Availability text", type: "text" },
      { key: "footer.copyright", label: "Copyright", type: "text" },
    ],
  },
  {
    id: "nav",
    label: "Navigation",
    fields: [
      { key: "nav.brand", label: "Brand name", type: "text" },
      { key: "nav.subtitle", label: "Subtitle", type: "text" },
    ],
  },
  {
    id: "meta",
    label: "Meta",
    fields: [
      { key: "meta.title", label: "Page title", type: "text" },
      { key: "meta.description", label: "Meta description", type: "textarea" },
    ],
  },
];

export default function SiteConfigEditor() {
  const { data: configs, refetch } = api.siteConfig.getAll.useQuery();
  const setConfig = api.siteConfig.set.useMutation({
    onSuccess: () => refetch(),
  });
  const deleteConfig = api.siteConfig.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("hero");

  const getValue = (key: string) => {
    if (editValues[key] !== undefined) return editValues[key];
    const config = configs?.find((c) => c.key === key);
    return config?.value ?? "";
  };

  const handleSave = async (key: string) => {
    setSavingKeys((prev) => new Set(prev).add(key));
    await setConfig.mutateAsync({
      key,
      value: editValues[key] ?? getValue(key),
    });
    setSavingKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
    setEditValues((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const allKeys = configSections.flatMap((s) => s.fields.map((f) => f.key));
  const customConfigs = configs?.filter((c) => !allKeys.includes(c.key)) ?? [];

  return (
    <div>
      {/* Tabs */}
      <div
        className="mb-8 flex gap-0 border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)", marginBottom: "32px" }}
      >
        {configSections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveTab(section.id)}
            className="transition-colors"
            style={{
              padding: "12px 18px",
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: activeTab === section.id ? "var(--fg)" : "var(--muted)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              borderBottom:
                activeTab === section.id
                  ? "2px solid var(--accent)"
                  : "2px solid transparent",
              marginBottom: "-1px",
              background: "transparent",
              border: "0",
              cursor: "pointer",
              transition: "color 0.12s, border-color 0.12s",
            }}
          >
            {section.label}
          </button>
        ))}
        <button
          onClick={() => setActiveTab("custom")}
          className="transition-colors"
          style={{
            padding: "12px 18px",
            fontFamily: "var(--mono)",
            fontSize: "11px",
            color: activeTab === "custom" ? "var(--fg)" : "var(--muted)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            borderBottom:
              activeTab === "custom"
                ? "2px solid var(--accent)"
                : "2px solid transparent",
            marginBottom: "-1px",
            background: "transparent",
            border: "0",
            cursor: "pointer",
            transition: "color 0.12s, border-color 0.12s",
          }}
        >
          Custom
        </button>
      </div>

      {/* Content */}
      {configSections.map(
        (section) =>
          activeTab === section.id && (
            <div
              key={section.id}
              style={{
                border: "1px solid rgba(255,255,255,0.05)",
                padding: "28px 32px",
                marginBottom: "24px",
                background: "var(--bg)",
              }}
            >
              <div
                className="mb-6 flex items-start justify-between gap-6 pb-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "16px",
                      color: "var(--fg)",
                      fontWeight: 500,
                      margin: "0 0 4px",
                    }}
                  >
                    {section.label}
                  </h2>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "11px",
                      color: "var(--muted)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Edit {section.label.toLowerCase()} section content
                  </div>
                </div>
              </div>

              <div
                className="grid gap-6"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px 28px",
                }}
              >
                {section.fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.type === "textarea" ? "full" : ""}
                    style={
                      field.type === "textarea" ? { gridColumn: "1 / -1" } : {}
                    }
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        style={{
                          fontSize: "13px",
                          color: "var(--fg-2)",
                          display: "block",
                          marginBottom: "6px",
                        }}
                      >
                        {field.label}
                        {field.description && (
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "10px",
                              color: "var(--dim)",
                              letterSpacing: "0.06em",
                              marginLeft: "8px",
                            }}
                          >
                            {field.description}
                          </span>
                        )}
                      </label>
                      {savingKeys.has(field.key) && (
                        <span
                          className="inline-flex items-center gap-1.5"
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10px",
                            color: "var(--accent)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            className="h-1 w-1 rounded-full"
                            style={{ background: "var(--accent)" }}
                          />
                          Saved
                        </span>
                      )}
                    </div>
                    {field.type === "textarea" ? (
                      <textarea
                        value={getValue(field.key)}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "var(--bg-2)",
                          color: "var(--fg)",
                          fontSize: "14px",
                          lineHeight: "1.5",
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "var(--sans)",
                        }}
                        onBlur={() => handleSave(field.key)}
                      />
                    ) : (
                      <input
                        type="text"
                        value={getValue(field.key)}
                        onChange={(e) =>
                          setEditValues((prev) => ({
                            ...prev,
                            [field.key]: e.target.value,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "var(--bg-2)",
                          color: "var(--fg)",
                          fontSize: "14px",
                          outline: "none",
                          fontFamily: "var(--sans)",
                        }}
                        onBlur={() => handleSave(field.key)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ),
      )}

      {activeTab === "custom" && (
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.05)",
            padding: "28px 32px",
            marginBottom: "24px",
            background: "var(--bg)",
          }}
        >
          <div
            className="mb-6 flex items-start justify-between gap-6 pb-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <h2
                style={{
                  fontSize: "16px",
                  color: "var(--fg)",
                  fontWeight: 500,
                  margin: "0 0 4px",
                }}
              >
                Custom keys
              </h2>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  letterSpacing: "0.08em",
                }}
              >
                Additional configuration keys
              </div>
            </div>
          </div>

          <div
            className="grid gap-6"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px 28px",
            }}
          >
            {customConfigs.map((config) => (
              <div
                key={config.key}
                className="full"
                style={{ gridColumn: "1 / -1" }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <label
                    style={{
                      fontSize: "13px",
                      color: "var(--fg-2)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    {config.key}
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--dim)",
                        letterSpacing: "0.06em",
                        marginLeft: "8px",
                        padding: "2px 6px",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {config.type}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteConfig.mutate({ key: config.key })}
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "#c97a72",
                      border: "1px solid rgba(201,122,114,0.4)",
                      background: "transparent",
                      padding: "6px 10px",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                    className="transition-colors hover:border-[#c97a72] hover:bg-[#c97a72] hover:text-white"
                  >
                    Delete
                  </button>
                </div>
                <textarea
                  value={getValue(config.key)}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [config.key]: e.target.value,
                    }))
                  }
                  rows={2}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg-2)",
                    color: "var(--fg)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "var(--sans)",
                  }}
                  onBlur={() => handleSave(config.key)}
                />
              </div>
            ))}
            {customConfigs.length === 0 && (
              <div
                className="full py-12 text-center"
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "48px 24px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    color: "var(--dim)",
                    letterSpacing: "0.18em",
                    marginBottom: "10px",
                  }}
                >
                  ∅
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    color: "var(--fg)",
                    fontWeight: 500,
                    margin: "0 0 8px",
                  }}
                >
                  No custom keys
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--muted)",
                    margin: "0",
                    maxWidth: "42ch",
                  }}
                >
                  Custom configuration keys will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
