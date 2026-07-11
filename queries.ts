// Data fetching for the Command Center dashboard.
// All queries run server-side via the secret-key Supabase client.
// Promise.all batches them in parallel — single round trip-ish.

import { supabase } from "./supabase";

export type WeeklyTimeBucket = {
  bucket_id: number;
  bucket_name: string;
  color_hex: string;
  target_hours: number;
  actual_hours: number;
};

export type Todo = {
  id: string;
  task: string;
  bucket_id: number | null;
  done: boolean;
  due_date: string | null;
  date_completed: string | null;
};

export type Goal = {
  id: string;
  goal: string;
  bucket_id: number | null;
  deadline: string | null;
  progress_pct: number;
};

export type OnHoldItem = {
  id: string;
  name: string;
  reason: string | null;
};

export type DashboardData = {
  tiles: {
    jobSearch: { interviewRate: number; totalApplications: number };
    testPrep: { completed: number; total: number };
    portfolio: { inPlay: number; total: number };
    contentThisWeek: number;
    coursework: { done: number; due: number };
    emba: { shortlisted: number; target: number };
  };
  weeklyTime: WeeklyTimeBucket[];
  openTodos: Todo[];
  completedTodos: Todo[];
  goals: Goal[];
  onHold: OnHoldItem[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const [
    jobSearchRes,
    testPrepRes,
    portfolioRes,
    contentRes,
    courseworkRes,
    embaRes,
    weeklyTimeRes,
    openTodosRes,
    completedTodosRes,
    goalsRes,
    onHoldRes,
  ] = await Promise.all([
    supabase.from("v_job_search_active").select("interview_rate,total_applications").single(),
    supabase.from("v_test_prep_progress").select("completed,total").single(),
    supabase.from("v_portfolio_progress").select("in_play,total").single(),
    supabase.from("v_content_this_week").select("this_week").single(),
    supabase.from("v_coursework_week").select("done_this_week,due_this_week").single(),
    supabase.from("v_emba_week").select("schools_shortlisted,schools_target").single(),
    supabase.from("v_weekly_time_current").select("*"),
    supabase
      .from("todos")
      .select("id,task,bucket_id,done,due_date,date_completed")
      .eq("done", false)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(8),
    supabase
      .from("todos")
      .select("id,task,bucket_id,done,due_date,date_completed")
      .eq("done", true)
      .order("date_completed", { ascending: false })
      .limit(8),
    supabase
      .from("goals")
      .select("id,goal,bucket_id,deadline,progress_pct")
      .order("bucket_id"),
    supabase.from("on_hold").select("id,name,reason"),
  ]);

  return {
    tiles: {
      jobSearch: {
        interviewRate: jobSearchRes.data?.interview_rate ?? 0,
        totalApplications: jobSearchRes.data?.total_applications ?? 0,
      },
      testPrep: {
        completed: testPrepRes.data?.completed ?? 0,
        total: testPrepRes.data?.total ?? 43,
      },
      portfolio: {
        inPlay: portfolioRes.data?.in_play ?? 0,
        total: portfolioRes.data?.total ?? 0,
      },
      contentThisWeek: contentRes.data?.this_week ?? 0,
      coursework: {
        done: courseworkRes.data?.done_this_week ?? 0,
        due: courseworkRes.data?.due_this_week ?? 0,
      },
      emba: {
        shortlisted: embaRes.data?.schools_shortlisted ?? 0,
        target: embaRes.data?.schools_target ?? 4,
      },
    },
    weeklyTime: (weeklyTimeRes.data ?? []) as WeeklyTimeBucket[],
    openTodos: (openTodosRes.data ?? []) as Todo[],
    completedTodos: (completedTodosRes.data ?? []) as Todo[],
    goals: (goalsRes.data ?? []) as Goal[],
    onHold: (onHoldRes.data ?? []) as OnHoldItem[],
  };
}
