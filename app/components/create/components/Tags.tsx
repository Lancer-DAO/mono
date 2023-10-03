import { api } from "@/src/utils";
import { QuestFormData } from "@/types/forms";
import { useState } from "react";

const Tags = ({
  formData,
  setFormData,
}: {
  formData: QuestFormData;
  setFormData: (formData: QuestFormData) => void;
}) => {
  const [query, setQuery] = useState<string | null>();

  const { data, isLoading } = api.bounties.tags.get.useQuery(
    { query },
    {
      enabled: !!query,
    }
  );

  // const displayedTags = formData.tags.slice(0, 4).map((tag) => tag);

  // const tagOverflow = formData.tags.filter((tag) => tag !== "").length > 4;

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

  const removeTag = (tag: string) => {
    const newTags = formData.tags.filter((t) => t !== tag);

    setFormData({
      ...formData,
      tags: newTags,
    });
  };

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap">
        {formData.tags.map((tag, key) => (
          <div
            className="bg-neutral100 border flex border-neutral200 
              hover:bg-neutral50 cursor-pointer rounded-lg px-4 py-2 pr-2
              items-center gap-x-1.5 mr-2 mb-2 text-neutral500 text-sm"
            key={key}
            onClick={() => removeTag(tag)}
          >
            <div className="-mt-0.5 truncate">{tag}</div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        ))}
      </div>
      <input
        className="placeholder:text-neutral400 text-sm border bg-neutral100 border-neutral200 w-full  rounded-lg px-4 py-2"
        placeholder="Enter tags"
        value={query ? query : ""}
        onChange={handleInput}
      />

      {query && (
        <div
          className={`w-full bg-white absolute border z-50 p-2 flex flex-col gap-y-1 rounded-lg ${
            formData.tags.length > 0 ? "top-24" : "top-14"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-1/3 h-6 animate-pulse bg-neutral200 rounded m-2"></div>
              <div className="w-1/3 h-6 animate-pulse bg-neutral200 rounded m-2"></div>
              <div className="w-1/3 h-6 animate-pulse bg-neutral200 rounded m-2"></div>
            </>
          ) : data.length > 0 ? (
            <>
              {data?.map((tag, key) => (
                <div
                  className="rounded hover:bg-neutral100 transition-all p-2 cursor-pointer"
                  key={key}
                  onClick={() => handleTagClick(tag.name)}
                >
                  {tag.name}
                </div>
              ))}
            </>
          ) : (
            <div
              className="flex items-center justify-between rounded hover:bg-neutral100 transition-all p-2 cursor-pointer"
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
