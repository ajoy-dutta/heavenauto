const AdminPlaceholder = ({ title }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center py-20">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">{title}</h2>
      <p className="text-gray-500">
        This module is currently under development.
      </p>
    </div>
  );
};

export default AdminPlaceholder;