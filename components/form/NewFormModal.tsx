/* This example requires Tailwind CSS v2.0+ */
import { Dialog, RadioGroup, Transition } from "@headlessui/react";
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { Fragment, useState } from "react";
import { BsPlus } from "react-icons/bs";
import { createForm } from "../../lib/forms";
import { createNoCodeForm } from "../../lib/noCodeForm";
import { classNames } from "../../lib/utils";
import StandardButton from "../StandardButton";
import dayjs from "dayjs";

const formTypes = [
  {
    id: "NOCODE",
    title: "No-Code Builder",
    description:
      "Use the Notion-like builder to build your form without a single line of code.",
  },
  {
    id: "CODE",
    title: "Code",
    description:
      "Use the snoopReact library to code the form yourself and manage the data here.",
    additionalDescription: "",
  },
];

type FormOnboardingModalProps = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

export default function NewFormModal({
  open,
  setOpen,
}: FormOnboardingModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState(Date());
  const [description, setDescription] = useState("");
  const [formType, setFormType] = useState(formTypes[0].id); //formTypes[0]

  console.log(`#### sourcingName: ${name} dueDate: ${dayjs(dueDate).toDate()} and description: ${description} formtype: ${formType}`);
  
  const createFormAction = async (e) => {
    e.preventDefault();
    const form = await createForm({
      name,
      dueDate:dayjs(dueDate).toDate(),
      description,
      formType,
    });
    
    if (form.formType === "NOCODE") {
      await createNoCodeForm(form.id);
    }
    router.push(`/forms/${form.id}/form`);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-30 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative px-4 pt-5 pb-4 text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:max-w-lg sm:w-full sm:p-6">
                <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                  <button
                    type="button"
                    className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-0 focus:ring-offset-2"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="flex flex-row justify-between">
                  <h2 className="flex-none p-2 text-xl font-bold text-ui-gray-dark">
                    Create new sourcing
                  </h2>
                </div>
                <form
                  onSubmit={(e) => createFormAction(e)}
                  className="inline-block w-full p-2 overflow-hidden text-left align-bottom transition-all transform sm:align-middle"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-light text-ui-gray-dark"
                    >
                      Name your sourcing
                    </label>
                    <div className="mt-2">
                      <input
                        type="text"
                        name="name"
                        className="block w-full p-2 mb-6 border-none rounded bg-ui-gray-light focus:ring-2 focus:ring-red sm:text-sm placeholder:font-extralight placeholder:text-ui-gray-medium"
                        placeholder="e.g. Customer Research Survey"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                    
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-light text-ui-gray-dark"
                    >
                      Due date for your sourcing
                    </label>
                    <div className="mt-2">
                      <input
                        type="date"
                        name="dueDate"
                        className="block w-full p-2 mb-6 border-none rounded bg-ui-gray-light focus:ring-2 focus:ring-red sm:text-sm placeholder:font-extralight placeholder:text-ui-gray-medium"
                        placeholder="e.g. Customer Research Survey"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                    
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="text-sm font-light text-ui-gray-dark"
                    >
                      Describe your sourcing
                    </label>
                    <div className="mt-2">
                      <textarea name="description" id="description" value={description} autoFocus onChange={(e) => setDescription(e.target.value)} cols={30} rows={5}                         className="block w-full p-2 mb-6 border-none rounded bg-ui-gray-light focus:ring-2 focus:ring-red sm:text-sm placeholder:font-extralight placeholder:text-ui-gray-medium"/>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <StandardButton fullwidth type="submit">
                      create sourcing
                      <BsPlus className="w-6 h-6 ml-1"></BsPlus>
                    </StandardButton>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
