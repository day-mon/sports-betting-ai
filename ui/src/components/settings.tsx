import { ComponentProps } from "solid-js";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger
} from "~/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "~/components/ui/select.tsx";
import { OcGear3 } from "solid-icons/oc";

export interface SettingsProps extends ComponentProps<"div"> {
  theme: string;
  callback: (theme: string) => void;
}

export function Settings(props: SettingsProps) {
  const availableThemes = ["blackout", "logan", "lavender", "light", "blue"];

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <OcGear3 class="w-6 h-6" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Settings</AlertDialogTitle>
        <AlertDialogDescription>
          <label class="block text-sm font-medium mb-2">Theme</label>
          <Select
            value={props.theme}
            onChange={props.callback}
            options={availableThemes}
            placeholder="Select a theme"
            itemComponent={props => (
              <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
            )}
          >
            <SelectTrigger aria-label="Theme" class="w-[180px]">
              <SelectValue<string>>{state => state.selectedOption()}</SelectValue>
            </SelectTrigger>
            <SelectContent />
          </Select>
        </AlertDialogDescription>
      </AlertDialogContent>
    </AlertDialog>
  );
}
