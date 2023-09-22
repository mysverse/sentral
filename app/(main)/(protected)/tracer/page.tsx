import { NextPage } from "next";
import Head from "next/head";

import Footer from "components/footer";

import Navigation from "components/nav";
import MysverseStats from "components/bandarStats";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";

export default async function Main() {
  const session = await getServerSession(authOptions);
  // const testId = 31585182;
  return (
    <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
      {session?.user.id ? <MysverseStats userId={session.user.id} /> : null}
    </div>
  );
}
