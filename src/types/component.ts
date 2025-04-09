import { Devvit } from "@devvit/public-api";
import { ComponentType } from "../api/Schema.js";

export interface FormProps {
  context: Devvit.Context;
  onSave: (data: ComponentType) => void;
  component?: ComponentType;
}
