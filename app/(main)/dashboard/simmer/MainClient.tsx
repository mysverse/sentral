"use client";

import { useState, useEffect } from "react";
import { checkEmail, createEmail } from "utils/sim";

interface Group {
  group: {
    id: number;
    name: string;
  };
  role: {
    name: string;
  };
}

interface MainClientProps {
  authorised: boolean;
  groups: Group[];
  userId: number;
  username: string;
}

export default function MainClient({
  authorised,
  groups,
  userId,
  username
}: MainClientProps) {
  const [emailExists, setEmailExists] = useState(false);
  const [emailPassword, setEmailPassword] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);

  useEffect(() => {
    async function checkUserEmail() {
      const emailCheck = await checkEmail(userId, username);
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
    const emailCreate = await createEmail(userId, username);
    if (emailCreate.success && emailCreate.email && emailCreate.password) {
      setEmail(emailCreate.email);
      setEmailPassword(emailCreate.password);
    }
    setLoading(false);
  };

  if (!authorised) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800">
          You are not authorised to view this page.
        </h1>
      </div>
    );
  }

  return (
    <div className="mx-auto p-2 md:p-4">
      <div className="mb-12">
        <h1 className="mb-4 text-2xl font-bold text-gray-800 md:text-3xl">
          Welcome, {username}
        </h1>
        <h2 className="mb-6 text-lg font-semibold text-gray-700 md:text-xl">
          Your Groups
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {groups.map((group) => (
            <div
              key={group.group.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-800 md:text-xl">
                {group.group.name}
              </h3>
              <p className="text-gray-600">{group.role.name}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Email Feature */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Email Access
          </h2>
          {loading ? (
            <p className="text-gray-700">Loading...</p>
          ) : emailExists && email ? (
            <div className="rounded-lg bg-green-50 p-4">
              <p className="mb-2 text-gray-800">
                You already have an email:
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
              <p className="mt-2 text-sm text-gray-500">
                Note: It may take 5 to 10 minutes for your email account to be
                fully set up. During this time, you may experience login issues.
              </p>
            </div>
          ) : emailPassword ? (
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="mb-4 text-lg font-semibold text-gray-800">
                Your email has been created successfully!
              </p>
              <div className="mb-4">
                <p className="text-sm text-gray-700">Email:</p>
                <p className="text-xl font-medium text-gray-800">{email}</p>
                <p className="mt-2 text-sm text-gray-700">Password:</p>
                <p className="text-xl font-medium text-gray-800">
                  {emailPassword}
                </p>
              </div>
              {!passwordConfirmed ? (
                <>
                  <p className="mb-4 text-red-600">
                    Please copy your password now. You won&apos;t be able to see
                    it again.
                  </p>
                  <button
                    onClick={() => setPasswordConfirmed(true)}
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
                    Note: It may take 5 to 10 minutes for your email account to
                    be fully set up. During this time, you may experience login
                    issues.{" "}
                    <strong>
                      We strongly recommend immediately changing the default
                      password after logging in.
                    </strong>
                  </p>
                </>
              )}
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
        {/* Coming Soon Placeholder 1 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Feature Coming Soon
          </h2>
          <p className="text-gray-600">
            This feature will be available soon. Stay tuned!
          </p>
        </div>
        {/* Coming Soon Placeholder 2 */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Feature Coming Soon
          </h2>
          <p className="text-gray-600">
            This feature will be available soon. Stay tuned!
          </p>
        </div>
      </div>
    </div>
  );
}
