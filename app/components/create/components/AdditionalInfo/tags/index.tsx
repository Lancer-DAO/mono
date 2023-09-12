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
      <div className="flex">
        {formData.tags.map((tag, key) => (
          <div
            className="bg-neutralBtn border flex border-neutralBtnBorder hover:bg-neutral-50 cursor-pointer rounded-full px-3 pr-2 h-8 items-center gap-x-1.5 mr-2 mb-2 text-textGreen/70"
            key={key}
            onClick={() => removeTag(tag)}
          >
            <div className="-mt-0.5">{tag}</div>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        ))}
      </div>
      <input
        className="placeholder:text-textGreen/70 border bg-neutralBtn border-neutralBtnBorder w-full h-[50px] rounded-lg px-3"
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
              <div className="w-1/3 h-6 animate-pulse bg-neutral-200 rounded m-2"></div>
              <div className="w-1/3 h-6 animate-pulse bg-neutral-200 rounded m-2"></div>
              <div className="w-1/3 h-6 animate-pulse bg-neutral-200 rounded m-2"></div>
            </>
          ) : data.length > 0 ? (
            <>
              {data?.map((tag, key) => (
                <div
                  className="rounded hover:bg-neutral-100 transition-all p-2 cursor-pointer"
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
