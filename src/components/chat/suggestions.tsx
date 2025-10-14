import { Search } from 'lucide-react';

interface SuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
}

export function Suggestions({ suggestions, onSelectSuggestion }: SuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute bottom-full mb-2 w-full bg-white dark:bg-card rounded-xl border shadow-lg p-4">
      <ul className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            onClick={() => onSelectSuggestion(suggestion)}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer"
          >
            <Search className="size-4 text-muted-foreground" />
            <span>{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
