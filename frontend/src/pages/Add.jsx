import React from "react";
import { X } from "lucide-react";
import { modalStyles } from "../assets/dummyStyles";

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  type = "both",
  title = "Add New Transaction",
  buttonText = "Add Transaction",
  categories = [
    "Food",
    "Housing",
    "Transport",
    "Shopping",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Salary",
    "Freelance",
    "Investments",
    "Bonus",
    "Other",
  ],
  color = "teal",
}) => {
  if (!showModal) return null;

  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const currentYear = today.getFullYear();

  const currentDate = `${currentYear}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(today.getDate()).padStart(2, "0")}`;

  const minDate = `${currentYear}-01-01`;

  const colorClass = modalStyles.colorClasses[color];

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modalContainer}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>{title}</h3>

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className={modalStyles.closeButton}
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            console.log("FORM SUBMITTED");
            console.log("FORM DATA:", newTransaction);
            console.log("HANDLER:", handleAddTransaction);

            try {
              await handleAddTransaction();
              console.log("HANDLER FINISHED");
            } catch (error) {
              console.error("HANDLER ERROR:", error);
            }
          }}
          className={modalStyles.form}
        >
          {/* Description */}
          <div>
            <label className={modalStyles.label}>Description</label>

            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) => {
                setNewTransaction((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              className={modalStyles.input(colorClass.ring)}
              placeholder={
                type === "both"
                  ? "Salary, funds, etc."
                  : "Groceries, Rent, etc."
              }
              required
            />
          </div>

          <div>
            <label className={modalStyles.label}>Amount</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={newTransaction.amount}
              onChange={(e) => {
                setNewTransaction((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }));
              }}
              className={modalStyles.input(colorClass.ring)}
              placeholder="0.00"
              required
            />
          </div>

          {type === "both" && (
            <div>
              <label className={modalStyles.label}>Type</label>
              <div className={modalStyles.typeButtonContainer}>
                <button
                  type="button"
                  className={modalStyles.typeButton(
                    newTransaction.type === "income",
                    modalStyles.colorClasses.teal.typeButtonSelected,
                  )}
                  onClick={() =>
                    setNewTransaction((prev) => ({ ...prev, type: "income" }))
                  }
                >
                  Income
                </button>
                <button
                  type="button"
                  className={modalStyles.typeButton(
                    newTransaction.type === "expense",
                    modalStyles.colorClasses.orange.typeButtonSelected,
                  )}
                  onClick={() =>
                    setNewTransaction((prev) => ({ ...prev, type: "expense" }))
                  }
                >
                  Expense
                </button>
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className={modalStyles.label}>Category</label>

            <select
              value={newTransaction.category}
              onChange={(e) => {
                setNewTransaction((prev) => ({
                  ...prev,
                  category: e.target.value,
                }));
              }}
              className={modalStyles.input(colorClass.ring)}
              required
            >
              <option value="">Select Category</option>

              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className={modalStyles.label}>Date</label>

            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => {
                setNewTransaction((prev) => ({
                  ...prev,
                  date: e.target.value,
                }));
              }}
              min={minDate}
              max={currentDate}
              className={modalStyles.input(colorClass.ring)}
              required
            />
          </div>
          {/* Submit Button */}
          <button
            type="submit"
            onClick={() => console.log("ADD BUTTON CLICKED")}
            className={modalStyles.submitButton(colorClass.button)}
          >
            {buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
