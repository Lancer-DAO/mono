import { CopyLinkField } from "@/components";
import { useState } from "react";

const LinksCard = () => {
  const [editMode, setEditMode] = useState(true);
  const [editedLinks, setEditedLinks] = useState([
    {
      title: "Portfolio",
      url: "http://localhost:3000/account"
    },
    {
      title: "GitHub",
      url: "https://github.com/ssamkkim"
    },
    {
      title: "LinkedIn",
      url: "https://www.linkedin.com/in/samuel-kim-a1b1a1252/"
    }
  ]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleSaveClick = () => {
    setEditMode(false);
  };

  const handleTitleChange = (index, value) => {
    const updatedLinks = [...editedLinks];
    updatedLinks[index].title = value;
    setEditedLinks(updatedLinks);
  };

  const handleUrlChange = (index, value) => {
    const updatedLinks = [...editedLinks];
    updatedLinks[index].url = value;
    setEditedLinks(updatedLinks);
  };

  return (
    <div className="my-6">
      <p className="text-textGreen font-bold text-2xl mb-6">Links</p>
      {editedLinks.map((link, index) => (
        <div key={index} className="my-4 w-3/4">
          {editMode ? (
            <div className="flex flex-col">
              <input
                type="text"
                value={link.title}
                onChange={(e) => handleTitleChange(index, e.target.value)}
                className="border border-primaryBtnBorder rounded-md px-2 py-1 mb-2 text-sm"
              />
              <input
                type="text"
                value={link.url}
                onChange={(e) => handleUrlChange(index, e.target.value)}
                className="border border-primaryBtnBorder rounded-md px-4 py-4 text-sm"
              />
            </div>
          ) : (
            <>
              <p className="text-textGreen uppercase pb-2 px-1 font-medium text-sm">
                {link.title}
              </p>
              <CopyLinkField url={link.url} link={true} />
            </>
          )}
        </div>
      ))}
      {editMode ? (
        <div className="my-3">
          <button
            onClick={handleSaveClick}
            className="border bg-primaryBtn border-primaryBtnBorder text-lg rounded-md px-6 py-3 uppercase font-bold text-textGreen mt-4"
          >
            Save
          </button>
        </div>
      ) : (
        <div className="my-3">
          <button
            onClick={handleEditClick}
            className="border bg-primaryBtn border-primaryBtnBorder text-lg rounded-md px-6 py-3 uppercase font-bold text-textGreen mt-4"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default LinksCard;
