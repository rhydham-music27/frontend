import { useEffect, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { getSubjects, SubjectOption } from '@/services/subjectService';

interface SubjectsMultiSelectProps {
  selected: string[];
  onChange: (subjects: string[]) => void;
  error?: string;
}

export const SubjectsMultiSelect = ({ selected, onChange, error }: SubjectsMultiSelectProps) => {
  const [open, setOpen] = useState(false);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getSubjects();
        if (isMounted) {
          setSubjects(data);
        }
      } catch {
        // silently ignore and leave subjects empty
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelect = (subject: string) => {
    const newSelected = selected.includes(subject)
      ? selected.filter(s => s !== subject)
      : [...selected, subject];
    onChange(newSelected);
  };

  const handleRemove = (subject: string) => {
    onChange(selected.filter(s => s !== subject));
  };

  return (
    <div className="space-y-2 bg-white">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={`w-full justify-between ${error ? 'border-red-500' : 'border-gray-300'} hover:border-[#001F54] hover:bg-transparent hover:text-inherit`}
          >
            <span className="text-gray-500">
              {selected.length > 0 ? `${selected.length} subject(s) selected` : 'Select subjects you can teach'}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search subjects..." />
            <CommandEmpty>No subject found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {subjects.map((subject) => (
                <CommandItem
                  key={subject._id}
                  onSelect={() => handleSelect(subject.name)}
                  className="cursor-pointer hover:bg-[#001F54]/10 data-[selected=true]:bg-[#001F54]/10 data-[selected=true]:text-[#001F54]"
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      selected.includes(subject.name) ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {subject.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Subjects as Badges */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((subject) => (
            <Badge
              key={subject}
              variant="secondary"
              className="bg-[#001F54]/10 text-[#001F54] hover:bg-[#001F54]/20"
            >
              {subject}
              <button
                type="button"
                onClick={() => handleRemove(subject)}
                className="ml-1 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};