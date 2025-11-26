"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useUser } from "@/contexts/app";
import { useChat } from "ai/react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function TravelTangChatbot() {
  const t = useTranslations("traveltang.features.chatbot");
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/traveltang/chat",
    onError: (error) => {
      const errorMessage = error.message || t("error");
      if (errorMessage.includes("insufficient credits") || errorMessage.includes("credits")) {
        toast.error(t("no_credits"));
      } else {
        toast.error(errorMessage);
      }
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const exampleQuestions = [
    t("examples.q1"),
    t("examples.q2"),
    t("examples.q3"),
    t("examples.q4"),
  ];

  const handleExampleClick = (question: string) => {
    handleInputChange({ target: { value: question } } as any);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in first");
      return;
    }
    if (!input.trim()) {
      return;
    }
    handleSubmit(e);
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="text-center text-muted-foreground">
              <p className="mb-4">{t("examples.title")}</p>
              <div className="space-y-2">
                {exampleQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start"
                    onClick={() => handleExampleClick(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-muted-foreground">{t("thinking")}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="bg-destructive/10 text-destructive rounded-lg p-3">
              <p className="text-sm">{error.message || t("error")}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSubmit} className="p-4 border-t space-y-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder={t("placeholder")}
          disabled={isLoading || !user}
          className="min-h-[80px]"
        />
        <Button type="submit" disabled={isLoading || !user || !input.trim()}>
          {isLoading ? t("thinking") : t("send")}
        </Button>
      </form>
    </Card>
  );
}

