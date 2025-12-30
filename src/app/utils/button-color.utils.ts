export const getButtonClass = (colorKey: string): string => {
  const baseClass =
    'px-4 py-2 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 text-white ';

  const colorMap: { [key: string]: string } = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800',
    warning: 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700',
  };

  return baseClass + (colorMap[colorKey] || colorMap['secondary']);
};

export const getColorBadgeClass = (colorKey: string): string => {
  const colorMap: { [key: string]: string } = {
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-orange-100 text-orange-700 border-orange-200',
    secondary: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    'px-2 py-1 rounded text-xs font-medium border ' + (colorMap[colorKey] || colorMap['secondary'])
  );
};
