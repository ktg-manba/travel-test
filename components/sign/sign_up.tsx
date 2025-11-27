"use client";

import { Button } from "@/components/ui/button";
import { useAppContext } from "@/contexts/app";
import { useTranslations } from "next-intl";

export default function SignUp() {
  const t = useTranslations();
  const { setShowSignModal, setSignModalMode } = useAppContext();

  const handleClick = () => {
    setSignModalMode("signup");
    setShowSignModal(true);
  };

  return (
    <Button variant="default" onClick={handleClick}>
      {t("sign_modal.sign_up_title")}
    </Button>
  );
}


