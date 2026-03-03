"use client";

import { JobHeader } from "@/components/JobHeader";
import { useJob } from "@/components/JobProvider";

export function JobHeaderClient() {
  const { job, dispatch } = useJob();
  return (
    <JobHeader
      name={job.name}
      quantity={job.quantity}
      jobType={job.jobType}
      onChangeName={(v) => dispatch({ type: "SET_JOB_META", field: "name", value: v })}
      onChangeQuantity={(v) => dispatch({ type: "SET_JOB_META", field: "quantity", value: v })}
      onChangeJobType={(v) => dispatch({ type: "SET_JOB_META", field: "jobType", value: v })}
    />
  );
}
