import { api } from "@/src/utils";
import { FormData } from "@/types/forms";
import { useState } from "react";

const Tags = ({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: (formData: FormData) => void;
}) => {
  const [query, setQuery] = useState<string | null>();

  const { data, isLoading } = api.bounties.tags.get.useQuery(
    { query },
    {
      enabled: !!query,
    }
  );

  console.log(data);

  const handleInput = (e: any) => {
    if (e.target.value === "") {
      setQuery(null);
    }

    setQuery(e.target.value);
  };

  const handleTagClick = (tag: string) => {
    // check if tag already exists in formData tags
    if (formData.tags.find((t) => t === tag)) return;

    const newTags = [...formData.tags, tag];

    setFormData({
      ...formData,
      tags: newTags,
    });

    setQuery(null);
  };

  return (
    <div className="relative w-full">
      <input
        className="placeholder:text-textGreen/70 border bg-neutralBtn border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
        placeholder="Enter tags"
        onChange={handleInput}
      />

      {query && (
        <div className="w-full bg-white absolute border z-50 top-14 p-2 flex flex-col gap-y-1 rounded-lg">
          {isLoading ? (
            <>
              <div className="w-1/3 h-6 animate-pulse bg-neutral-200 rounded m-2"></div>
              <div className="w-1/3 h-6 animate-pulse bg-neutral-200 rounded m-2"></div>
              <div className="w-1/3 h-6 animate-pulse bg-neutral-200 rounded m-2"></div>
            </>
          ) : data.length > 0 ? (
            <>
              {data?.map((tag, key) => (
                <div
                  className="rounded hover:bg-neutral-100 uppercase transition-all p-2 cursor-pointer"
                  key={key}
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                </div>
              ))}
            </>
          ) : (
            <div
              className="flex items-center justify-between rounded hover:bg-neutral-100 transition-all p-2 cursor-pointer"
              onClick={() => handleTagClick(query)}
            >
              {query}

              <div className="p-1 border rounded-full px-3">+ create</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tags;
