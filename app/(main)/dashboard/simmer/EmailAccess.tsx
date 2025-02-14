"use client";

import { useState, useEffect } from "react";
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs sm:col-span-3">
      <h2 className="mb-4 text-xl font-semibold text-gray-800">Email Access</h2>
      {loading ? (
        <Spinner />
      ) : emailPassword ? (
        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="mb-4 text-lg font-semibold text-gray-800">
            {passwordConfirmed
              ? passwordReset
                ? "Your password has been reset successfully!"
                : "Your email has been created successfully!"
              : passwordReset
                ? "Your password has been reset!"
                : "Your email has been created!"}
          </p>
          <div className="mb-4">
            <p className="text-sm text-gray-700">Email:</p>
            <p className="text-xl font-medium text-gray-800">{email}</p>
            <p className="mt-2 text-sm text-gray-700">Password:</p>
            <p className="text-xl font-medium text-gray-800">{emailPassword}</p>
          </div>
          {!passwordConfirmed ? (
            <>
              <p className="mb-4 text-red-600">
                Please copy your password now. You won&apos;t be able to see it
                again.
              </p>
              <button
                onClick={() => {
                  setPasswordConfirmed(true);
                  if (passwordReset) {
                    setEmailPassword(null);
                    setPasswordReset(false);
                  }
                }}
                className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                I have copied my password
              </button>
            </>
          ) : (
            <>
              <p className="mt-4">
                Access your email at{" "}
                <a
                  href="https://mail.mysver.se"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  mail.mysver.se
                </a>
              </p>
              <p className="mt-2 text-sm text-gray-500">
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
          <p className="mb-2 text-gray-800">
            Your email:
            <span className="font-medium"> {email}</span>
          </p>
          <p>
            Access it at{" "}
            <a
              href="https://mail.mysver.se"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              mail.mysver.se
            </a>
          </p>
          <button
            onClick={handleResetPassword}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm text-white transition-colors hover:bg-red-700"
          >
            Reset Password
          </button>
          <p className="mt-2 text-sm text-gray-500">
            Note: After resetting, you will receive a new password.
          </p>
        </div>
      ) : (
        <button
          onClick={handleClaimEmail}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
        >
          Claim your email
        </button>
      )}
    </div>
  );
}
