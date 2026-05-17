"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

type Tab = "suggestions" | "responses" | "config";

interface SuggestionFormData {
  question: string;
  kind: string;
  tool: string;
  order: number;
  active: boolean;
}

interface ResponseFormData {
  trigger: string;
  response: string;
  order: number;
  active: boolean;
}

export default function ChatManager() {
  const { data: suggestions, refetch: refetchSuggestions } =
    api.chat.getAllSuggestions.useQuery();
  const { data: responses, refetch: refetchResponses } =
    api.chat.getAllResponses.useQuery();
  const { data: config, refetch: refetchConfig } =
    api.chat.getConfig.useQuery();

  const createSuggestion = api.chat.createSuggestion.useMutation({
    onSuccess: () => refetchSuggestions(),
  });
  const updateSuggestion = api.chat.updateSuggestion.useMutation({
    onSuccess: () => refetchSuggestions(),
  });
  const deleteSuggestion = api.chat.deleteSuggestion.useMutation({
    onSuccess: () => refetchSuggestions(),
  });

  const createResponse = api.chat.createResponse.useMutation({
    onSuccess: () => refetchResponses(),
  });
  const updateResponse = api.chat.updateResponse.useMutation({
    onSuccess: () => refetchResponses(),
  });
  const deleteResponse = api.chat.deleteResponse.useMutation({
    onSuccess: () => refetchResponses(),
  });

  const updateConfig = api.chat.updateConfig.useMutation({
    onSuccess: () => refetchConfig(),
  });

  const [tab, setTab] = useState<Tab>("suggestions");
  const [suggestionDialog, setSuggestionDialog] = useState(false);
  const [responseDialog, setResponseDialog] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(
    null,
  );
  const [editingResponse, setEditingResponse] = useState<string | null>(null);

  const [suggestionForm, setSuggestionForm] = useState<SuggestionFormData>({
    question: "",
    kind: "ask",
    tool: "",
    order: 0,
    active: true,
  });
  const [responseForm, setResponseForm] = useState<ResponseFormData>({
    trigger: "",
    response: "",
    order: 0,
    active: true,
  });
  const [configForm, setConfigForm] = useState({
    pageTitle: config?.pageTitle ?? "Ask Ali anything",
    modelName: config?.modelName ?? "gemini-2.5-flash",
    systemPrompt: config?.systemPrompt ?? "",
  });

  const openSuggestionCreate = () => {
    setSuggestionForm({
      question: "",
      kind: "ask",
      tool: "",
      order: 0,
      active: true,
    });
    setEditingSuggestion(null);
    setSuggestionDialog(true);
  };

  const openSuggestionEdit = (s: NonNullable<typeof suggestions>[number]) => {
    setSuggestionForm({
      question: s.question,
      kind: s.kind,
      tool: s.tool ?? "",
      order: s.order,
      active: s.active,
    });
    setEditingSuggestion(s.id);
    setSuggestionDialog(true);
  };

  const handleSuggestionSubmit = async () => {
    const data = { ...suggestionForm, tool: suggestionForm.tool || null };
    if (editingSuggestion) {
      await updateSuggestion.mutateAsync({ id: editingSuggestion, ...data });
    } else {
      await createSuggestion.mutateAsync(data);
    }
    setSuggestionDialog(false);
  };

  const openResponseCreate = () => {
    setResponseForm({ trigger: "", response: "", order: 0, active: true });
    setEditingResponse(null);
    setResponseDialog(true);
  };

  const openResponseEdit = (r: NonNullable<typeof responses>[number]) => {
    setResponseForm({
      trigger: r.trigger,
      response: r.response,
      order: r.order,
      active: r.active,
    });
    setEditingResponse(r.id);
    setResponseDialog(true);
  };

  const handleResponseSubmit = async () => {
    if (editingResponse) {
      await updateResponse.mutateAsync({
        id: editingResponse,
        ...responseForm,
      });
    } else {
      await createResponse.mutateAsync(responseForm);
    }
    setResponseDialog(false);
  };

  const handleConfigSave = async () => {
    await updateConfig.mutateAsync(configForm);
  };

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "suggestions", label: "Suggestions", count: suggestions?.length },
    { key: "responses", label: "Bot responses", count: responses?.length },
    { key: "config", label: "Page config" },
  ];

  return (
    <div>
      <div
        className="mb-8 flex items-end justify-between gap-6"
        style={{ marginBottom: "32px" }}
      >
        <div>
          <h1
            style={{
              fontSize: "28px",
              color: "var(--fg)",
              fontWeight: 500,
              letterSpacing: "-0.02em",
              margin: "0 0 6px",
            }}
          >
            Chat agent
          </h1>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "11px",
              color: "var(--muted)",
              letterSpacing: "0.1em",
            }}
          >
            Tune suggestions, keyword responses, and the system prompt.
          </div>
        </div>
      </div>

      <div
        className="flex gap-1"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          marginBottom: "28px",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="transition-colors"
            style={{
              fontFamily: "var(--sans)",
              fontSize: "13px",
              fontWeight: tab === t.key ? 500 : 400,
              color: tab === t.key ? "var(--fg)" : "var(--muted)",
              padding: "10px 16px",
              border: "0",
              borderBottom:
                tab === t.key
                  ? "1px solid var(--accent)"
                  : "1px solid transparent",
              background: "transparent",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "-1px",
            }}
          >
            {t.label}
            {typeof t.count === "number" && (
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  color: "var(--dim)",
                  letterSpacing: "0.06em",
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "suggestions" && (
        <div>
          <div
            className="flex flex-wrap items-center justify-between gap-3"
            style={{ marginBottom: "20px" }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Preset questions shown under the input
            </span>
            <button
              onClick={openSuggestionCreate}
              className="transition-colors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "var(--accent)",
                border: "1px solid var(--accent)",
                color: "#0d1410",
                fontWeight: 500,
                padding: "9px 14px",
                cursor: "pointer",
              }}
            >
              + New suggestion
            </button>
          </div>

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.05)",
              background: "var(--bg)",
            }}
          >
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      width: "50px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Question
                  </th>
                  <th
                    style={{
                      width: "100px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Kind
                  </th>
                  <th
                    style={{
                      width: "160px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Tool
                  </th>
                  <th
                    style={{
                      width: "80px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Order
                  </th>
                  <th
                    style={{
                      width: "90px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Active
                  </th>
                  <th
                    style={{
                      width: "120px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {suggestions?.map((s, i) => (
                  <tr
                    key={s.id}
                    className="transition-colors hover:bg-[var(--bg-2)]"
                  >
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--dim)",
                        letterSpacing: "0.06em",
                        verticalAlign: "middle",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontSize: "13px",
                        color: "var(--fg)",
                        fontWeight: 500,
                        verticalAlign: "middle",
                      }}
                    >
                      {s.question}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        verticalAlign: "middle",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "10px",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          border:
                            s.kind === "tool"
                              ? "1px solid rgba(125,211,168,0.35)"
                              : "1px solid rgba(255,255,255,0.08)",
                          color:
                            s.kind === "tool"
                              ? "var(--accent)"
                              : "var(--muted)",
                          display: "inline-flex",
                        }}
                      >
                        {s.kind === "tool" ? "Tool" : "Ask"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        color: "var(--dim)",
                        letterSpacing: "0.06em",
                        verticalAlign: "middle",
                      }}
                    >
                      {s.tool ?? "—"}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        color: "var(--fg-2)",
                        letterSpacing: "0.06em",
                        verticalAlign: "middle",
                      }}
                    >
                      {s.order}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        verticalAlign: "middle",
                      }}
                    >
                      <button
                        onClick={() =>
                          updateSuggestion.mutate({
                            id: s.id,
                            question: s.question,
                            kind: s.kind,
                            tool: s.tool,
                            order: s.order,
                            active: !s.active,
                          })
                        }
                        style={{
                          width: "32px",
                          height: "18px",
                          borderRadius: "9px",
                          border: "0",
                          background: s.active
                            ? "var(--accent)"
                            : "rgba(255,255,255,0.12)",
                          cursor: "pointer",
                          position: "relative",
                          transition: "background 0.15s",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: s.active ? "16px" : "2px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: "var(--fg)",
                            transition: "left 0.15s",
                          }}
                        />
                      </button>
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        verticalAlign: "middle",
                      }}
                    >
                      <div className="flex gap-3">
                        <button
                          onClick={() => openSuggestionEdit(s)}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10px",
                            color: "var(--muted)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: "transparent",
                            border: "0",
                            cursor: "pointer",
                          }}
                          className="transition-colors hover:text-[var(--fg)]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSuggestion.mutate({ id: s.id })}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10px",
                            color: "var(--muted)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: "transparent",
                            border: "0",
                            cursor: "pointer",
                          }}
                          className="transition-colors hover:text-[#c97a72]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!suggestions?.length && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "48px 24px",
                        textAlign: "center",
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
                        No suggestions
                      </h3>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--muted)",
                          margin: "0",
                          maxWidth: "42ch",
                        }}
                      >
                        Add your first suggestion to get started.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "responses" && (
        <div>
          <div
            className="flex flex-wrap items-center justify-between gap-3"
            style={{ marginBottom: "20px" }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "11px",
                color: "var(--muted)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Keyword-matched replies before the LLM runs
            </span>
            <button
              onClick={openResponseCreate}
              className="transition-colors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "var(--accent)",
                border: "1px solid var(--accent)",
                color: "#0d1410",
                fontWeight: 500,
                padding: "9px 14px",
                cursor: "pointer",
              }}
            >
              + New response
            </button>
          </div>

          <div
            style={{
              border: "1px solid rgba(255,255,255,0.05)",
              background: "var(--bg)",
            }}
          >
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      width: "50px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      width: "160px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Trigger
                  </th>
                  <th
                    style={{
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Response
                  </th>
                  <th
                    style={{
                      width: "80px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Order
                  </th>
                  <th
                    style={{
                      width: "90px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  >
                    Active
                  </th>
                  <th
                    style={{
                      width: "120px",
                      padding: "13px 18px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      fontFamily: "var(--mono)",
                      fontSize: "10px",
                      color: "var(--muted)",
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      fontWeight: 400,
                      background: "var(--bg-2)",
                    }}
                  ></th>
                </tr>
              </thead>
              <tbody>
                {responses?.map((r, i) => (
                  <tr
                    key={r.id}
                    className="transition-colors hover:bg-[var(--bg-2)]"
                  >
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontFamily: "var(--mono)",
                        fontSize: "10px",
                        color: "var(--dim)",
                        letterSpacing: "0.06em",
                        verticalAlign: "middle",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontSize: "13px",
                        color: "var(--fg)",
                        fontWeight: 500,
                        verticalAlign: "middle",
                      }}
                    >
                      {r.trigger}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontSize: "13px",
                        color: "var(--fg-2)",
                        verticalAlign: "middle",
                      }}
                    >
                      {r.response}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        fontFamily: "var(--mono)",
                        fontSize: "11px",
                        color: "var(--fg-2)",
                        letterSpacing: "0.06em",
                        verticalAlign: "middle",
                      }}
                    >
                      {r.order}
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        verticalAlign: "middle",
                      }}
                    >
                      <button
                        onClick={() =>
                          updateResponse.mutate({
                            id: r.id,
                            trigger: r.trigger,
                            response: r.response,
                            order: r.order,
                            active: !r.active,
                          })
                        }
                        style={{
                          width: "32px",
                          height: "18px",
                          borderRadius: "9px",
                          border: "0",
                          background: r.active
                            ? "var(--accent)"
                            : "rgba(255,255,255,0.12)",
                          cursor: "pointer",
                          position: "relative",
                          transition: "background 0.15s",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            top: "2px",
                            left: r.active ? "16px" : "2px",
                            width: "14px",
                            height: "14px",
                            borderRadius: "50%",
                            background: "var(--fg)",
                            transition: "left 0.15s",
                          }}
                        />
                      </button>
                    </td>
                    <td
                      style={{
                        padding: "13px 18px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                        verticalAlign: "middle",
                      }}
                    >
                      <div className="flex gap-3">
                        <button
                          onClick={() => openResponseEdit(r)}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10px",
                            color: "var(--muted)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: "transparent",
                            border: "0",
                            cursor: "pointer",
                          }}
                          className="transition-colors hover:text-[var(--fg)]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteResponse.mutate({ id: r.id })}
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "10px",
                            color: "var(--muted)",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            background: "transparent",
                            border: "0",
                            cursor: "pointer",
                          }}
                          className="transition-colors hover:text-[#c97a72]"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!responses?.length && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "48px 24px",
                        textAlign: "center",
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
                        No responses
                      </h3>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--muted)",
                          margin: "0",
                          maxWidth: "42ch",
                        }}
                      >
                        Add your first bot response to get started.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "config" && (
        <div>
          <section
            style={{
              border: "1px solid rgba(255,255,255,0.05)",
              background: "var(--bg)",
              padding: "24px 28px",
              marginBottom: "20px",
            }}
          >
            <div
              className="mb-6 flex items-start justify-between"
              style={{ marginBottom: "20px" }}
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
                  Page settings
                </h2>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  What appears at the top of /chat.
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px 24px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Page title
                </label>
                <input
                  type="text"
                  value={configForm.pageTitle}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, pageTitle: e.target.value })
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
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Model name display
                </label>
                <input
                  type="text"
                  value={configForm.modelName}
                  onChange={(e) =>
                    setConfigForm({ ...configForm, modelName: e.target.value })
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
                />
              </div>
            </div>
          </section>

          <section
            style={{
              border: "1px solid rgba(255,255,255,0.05)",
              background: "var(--bg)",
              padding: "24px 28px",
              marginBottom: "20px",
            }}
          >
            <div className="mb-6" style={{ marginBottom: "20px" }}>
              <h2
                style={{
                  fontSize: "16px",
                  color: "var(--fg)",
                  fontWeight: 500,
                  margin: "0 0 4px",
                }}
              >
                System prompt
              </h2>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  letterSpacing: "0.08em",
                }}
              >
                Sent on every request. Keep it tight.
              </div>
            </div>
            <div>
              <label
                style={{
                  fontSize: "13px",
                  color: "var(--fg-2)",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                System prompt
              </label>
              <textarea
                value={configForm.systemPrompt}
                onChange={(e) =>
                  setConfigForm({ ...configForm, systemPrompt: e.target.value })
                }
                rows={14}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "var(--bg-2)",
                  color: "var(--fg)",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "var(--mono)",
                }}
              />
            </div>
          </section>

          <div
            className="flex items-center justify-end gap-2"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              onClick={() =>
                setConfigForm({
                  pageTitle: config?.pageTitle ?? "Ask Ali anything",
                  modelName: config?.modelName ?? "gemini-2.5-flash",
                  systemPrompt: config?.systemPrompt ?? "",
                })
              }
              className="transition-colors hover:border-[var(--fg-2)] hover:text-[var(--fg)]"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "var(--fg-2)",
                padding: "9px 14px",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
            <button
              onClick={handleConfigSave}
              className="transition-colors"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "var(--mono)",
                fontSize: "11px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "var(--accent)",
                border: "1px solid var(--accent)",
                color: "#0d1410",
                fontWeight: 500,
                padding: "9px 14px",
                cursor: "pointer",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Suggestion Dialog */}
      {suggestionDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setSuggestionDialog(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto"
            style={{
              background: "var(--bg-2)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "28px 32px",
            }}
            onClick={(e) => e.stopPropagation()}
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
                  {editingSuggestion ? "Edit suggestion" : "New suggestion"}
                </h2>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {editingSuggestion
                    ? "Update suggestion details"
                    : "Add a new chat suggestion"}
                </div>
              </div>
              <button
                onClick={() => setSuggestionDialog(false)}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  cursor: "pointer",
                  background: "transparent",
                  border: "0",
                }}
                className="transition-colors hover:text-[var(--fg)]"
              >
                Close
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px 24px",
              }}
            >
              <div style={{ gridColumn: "1 / -1" }}>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Question
                </label>
                <input
                  type="text"
                  value={suggestionForm.question}
                  onChange={(e) =>
                    setSuggestionForm({
                      ...suggestionForm,
                      question: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Kind
                </label>
                <select
                  value={suggestionForm.kind}
                  onChange={(e) =>
                    setSuggestionForm({
                      ...suggestionForm,
                      kind: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                  }}
                >
                  <option value="ask">ask</option>
                  <option value="tool">tool</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Tool
                </label>
                <select
                  value={suggestionForm.tool}
                  onChange={(e) =>
                    setSuggestionForm({
                      ...suggestionForm,
                      tool: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                  }}
                >
                  <option value="">—</option>
                  <option value="message">message</option>
                  <option value="meeting">meeting</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Order
                </label>
                <input
                  type="number"
                  value={suggestionForm.order}
                  onChange={(e) =>
                    setSuggestionForm({
                      ...suggestionForm,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                  }}
                />
              </div>
              <div
                className="flex items-center gap-2"
                style={{ gridColumn: "1 / -1" }}
              >
                <input
                  type="checkbox"
                  id="suggestionActive"
                  checked={suggestionForm.active}
                  onChange={(e) =>
                    setSuggestionForm({
                      ...suggestionForm,
                      active: e.target.checked,
                    })
                  }
                  style={{ accentColor: "var(--accent)" }}
                />
                <label
                  htmlFor="suggestionActive"
                  style={{ fontSize: "13px", color: "var(--fg-2)" }}
                >
                  Active
                </label>
              </div>
            </div>

            <div
              className="mt-6 flex justify-end gap-2"
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setSuggestionDialog(false)}
                className="transition-colors hover:border-[var(--fg-2)] hover:text-[var(--fg)]"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--fg-2)",
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSuggestionSubmit}
                className="transition-colors"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "var(--accent)",
                  border: "1px solid var(--accent)",
                  color: "#0d1410",
                  fontWeight: 500,
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                {editingSuggestion ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Response Dialog */}
      {responseDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setResponseDialog(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto"
            style={{
              background: "var(--bg-2)",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "28px 32px",
            }}
            onClick={(e) => e.stopPropagation()}
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
                  {editingResponse ? "Edit response" : "New response"}
                </h2>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {editingResponse
                    ? "Update response details"
                    : "Add a new bot response"}
                </div>
              </div>
              <button
                onClick={() => setResponseDialog(false)}
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  color: "var(--muted)",
                  cursor: "pointer",
                  background: "transparent",
                  border: "0",
                }}
                className="transition-colors hover:text-[var(--fg)]"
              >
                Close
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Trigger keyword
                </label>
                <input
                  type="text"
                  value={responseForm.trigger}
                  onChange={(e) =>
                    setResponseForm({
                      ...responseForm,
                      trigger: e.target.value,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "var(--sans)",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "13px",
                    color: "var(--fg-2)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Response text
                </label>
                <textarea
                  value={responseForm.response}
                  onChange={(e) =>
                    setResponseForm({
                      ...responseForm,
                      response: e.target.value,
                    })
                  }
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "var(--bg)",
                    color: "var(--fg)",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    outline: "none",
                    resize: "vertical",
                    fontFamily: "var(--sans)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px 24px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "13px",
                      color: "var(--fg-2)",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Order
                  </label>
                  <input
                    type="number"
                    value={responseForm.order}
                    onChange={(e) =>
                      setResponseForm({
                        ...responseForm,
                        order: parseInt(e.target.value) || 0,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "var(--bg)",
                      color: "var(--fg)",
                      fontSize: "14px",
                      outline: "none",
                      fontFamily: "var(--sans)",
                    }}
                  />
                </div>
                <div
                  className="flex items-center gap-2"
                  style={{ paddingTop: "28px" }}
                >
                  <input
                    type="checkbox"
                    id="responseActive"
                    checked={responseForm.active}
                    onChange={(e) =>
                      setResponseForm({
                        ...responseForm,
                        active: e.target.checked,
                      })
                    }
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <label
                    htmlFor="responseActive"
                    style={{ fontSize: "13px", color: "var(--fg-2)" }}
                  >
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div
              className="mt-6 flex justify-end gap-2"
              style={{
                marginTop: "24px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => setResponseDialog(false)}
                className="transition-colors hover:border-[var(--fg-2)] hover:text-[var(--fg)]"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "var(--fg-2)",
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResponseSubmit}
                className="transition-colors"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--mono)",
                  fontSize: "11px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  background: "var(--accent)",
                  border: "1px solid var(--accent)",
                  color: "#0d1410",
                  fontWeight: 500,
                  padding: "9px 14px",
                  cursor: "pointer",
                }}
              >
                {editingResponse ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
