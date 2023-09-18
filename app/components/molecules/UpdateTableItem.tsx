export type UpdateType = "submission" | "message" | "application";
export type SubmissionType = "accepted" | "rejected" | "changes";
export type ApplicationType =
  // The person send an application
  | "applied"
  //   The person was accepted to the shortlist
  | "shortlisted"
  //   The person was at application stage but was rejected
  | "denied-application"
  //   The person was accepted to complete the quest
  | "accepted"
  //   The person was at shortlist stage but was rejected
  | "denied-shortlist";
