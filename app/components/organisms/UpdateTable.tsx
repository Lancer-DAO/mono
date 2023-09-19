import { useUserWallet } from "@/src/providers";
import dayjs from "dayjs";
import { UpdateTableItem } from "..";

const UpdateTable: React.FC = () => {
  const { currentUser } = useUserWallet();
  return (
    <div className="flex flex-col w-[505px] border-solid border bg-white border-neutralBorder500 rounded-lg">
      <div className="px-8 py-4 text-black">Updates History</div>
      <UpdateTableItem
        type="message"
        time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
        updater={currentUser}
      />
      <UpdateTableItem
        type="submission"
        subType="rejected"
        time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
        updater={currentUser}
      />
      <UpdateTableItem
        type="submission"
        subType="new"
        time={dayjs("Tue, 19 Sep 2023 02:26:53 GMT")}
        updater={currentUser}
      />
      <div className="px-8 py-4 text-black"></div>
    </div>
  );
};
export default UpdateTable;
