import React from "react";

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (data: { name: string }) => void | Promise<void>;
  fields: { label: string; name: "name"; type?: string }[];
  error?: string | null;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  fields,
  error,
}) => {
  const [formData, setFormData] = React.useState<{ name: string }>({
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>
          ))}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
