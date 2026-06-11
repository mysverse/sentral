"use client";

import { useState, useEffect } from "react";
import { Button } from "components/catalyst/button";
import Spinner from "components/spinner";
import { checkEmail, createEmail, resetEmail } from "utils/sim";

interface EmailAccessProps {
  userId: number;
  username: string;
}

export default function EmailAccess({ userId, username }: EmailAccessProps) {
  const [emailExists, setEmailExists] = useState(false);
  const [emailPassword, setEmailPassword] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    async function checkUserEmail() {
      const emailCheck = await checkEmail();
      setEmailExists(emailCheck.exists);
      if (emailCheck.email) {
        setEmail(emailCheck.email);
      }
      setLoading(false);
    }
    checkUserEmail();
  }, [userId, username]);

  const handleClaimEmail = async () => {
    setLoading(true);
    const emailCreate = await createEmail();
    if (emailCreate.success && emailCreate.email && emailCreate.password) {
      setEmail(emailCreate.email);
      setEmailPassword(emailCreate.password);
    }
    setLoading(false);
  };

  const handleResetPassword = async () => {
    setLoading(true);
    const emailReset = await resetEmail();
    if (emailReset.success && emailReset.email && emailReset.password) {
      setEmail(emailReset.email);
      setEmailPassword(emailReset.password);
      setPasswordConfirmed(false);
      setPasswordReset(true);
    }
    setLoading(false);
  };

  return (
    <div className="border-edge bg-surface rounded-lg border p-6 shadow-xs sm:col-span-3">
      <h2 className="text-strong mb-4 text-xl font-semibold">Email Access</h2>
      {loading ? (
        <Spinner />
      ) : emailPassword ? (
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-strong mb-4 text-lg font-semibold">
            {passwordConfirmed
              ? passwordReset
                ? "Your password has been reset successfully!"
                : "Your email has been created successfully!"
              : passwordReset
                ? "Your password has been reset!"
                : "Your email has been created!"}
          </p>
          <div className="mb-4">
            <p className="text-strong text-sm">Email:</p>
            <p className="text-strong text-xl font-medium">{email}</p>
            <p className="text-strong mt-2 text-sm">Password:</p>
            <p className="text-strong text-xl font-medium">{emailPassword}</p>
          </div>
          {!passwordConfirmed ? (
            <>
              <p className="mb-4 text-red-600">
                Please copy your password now. You won&apos;t be able to see it
                again.
              </p>
              <Button
                onClick={() => {
                  setPasswordConfirmed(true);
                  if (passwordReset) {
                    setEmailPassword(null);
                    setPasswordReset(false);
                  }
                }}
                className="mt-2 w-full"
              >
                I have copied my password
              </Button>
            </>
          ) : (
            <>
              <p className="mt-4">
                Access your email at{" "}
                <a
                  href="https://mail.mysver.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 underline"
                >
                  mail.mysver.se
                </a>
              </p>
              <p className="text-muted mt-2 text-sm">
                Note: It may take a few minutes for your account to be fully
                updated. During this time, you may experience login issues.{" "}
                <strong>
                  We strongly recommend immediately changing the default
                  password after logging in.
                </strong>
              </p>
            </>
          )}
        </div>
      ) : emailExists && email ? (
        <div className="rounded-lg bg-green-50 p-4">
          <p className="text-strong mb-2">
            Your email:
            <span className="font-medium"> {email}</span>
          </p>
          <p>
            Access it at{" "}
            <a
              href="https://mail.mysver.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 underline"
            >
              mail.mysver.se
            </a>
          </p>
          <Button onClick={handleResetPassword} color="red" className="mt-3">
            Reset Password
          </Button>
          <p className="text-muted mt-2 text-sm">
            Note: After resetting, you will receive a new password.
          </p>
        </div>
      ) : (
        <Button onClick={handleClaimEmail} className="w-full">
          Claim your email
        </Button>
      )}
    </div>
  );
}
