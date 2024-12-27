import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Bot,
  Brain,
  Code2,
  FileJson,
  MessageSquare,
  Save,
  Settings2,
  Sparkles,
  Wand2,
  FileSearch,
  Download,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface EditAssistantCardProps {
  assistant: any;
  isLoading: boolean;
  onUpdate: (assistant: any) => void;
}

const MODEL_OPTIONS = [
  {
    value: "gpt-4-turbo-preview",
    label: "GPT-4 Turbo",
    description: "Most capable model, best for complex tasks",
  },
  {
    value: "gpt-4",
    label: "GPT-4",
    description: "High performance for complex reasoning",
  },
  {
    value: "gpt-3.5-turbo",
    label: "GPT-3.5 Turbo",
    description: "Fast and cost-effective for simpler tasks",
  },
];

const TOOL_OPTIONS = [
  {
    id: "code_interpreter",
    name: "Code Interpreter",
    description: "Execute code and perform computations",
    icon: Code2,
    type: "code_interpreter",
  },
  {
    id: "file_search",
    name: "File Search",
    description: "Search through uploaded files",
    icon: FileSearch,
    type: "file_search",
  },
  {
    id: "downloadPDF",
    name: "PDF Download",
    description: "Download generated reports as PDF",
    icon: Download,
    type: "function",
    function: {
      name: "downloadPDF",
      description: "Download the generated Report",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The URL for the PDF to download",
          },
          outputPath: {
            type: "string",
            description: "The path to save the downloaded PDF",
          },
        },
        required: ["url", "outputPath"],
      },
    },
  },
];

const PRESET_INSTRUCTIONS = [
  {
    title: "Professional Assistant",
    content:
      "You are a professional AI assistant. Provide clear, accurate, and helpful responses while maintaining a professional tone. Focus on delivering practical solutions and valuable insights.",
  },
  {
    title: "Technical Expert",
    content:
      "You are a technical expert. Provide detailed technical explanations, code examples, and best practices. Focus on accuracy and educational value in your responses.",
  },
  {
    title: "Creative Writer",
    content:
      "You are a creative writing assistant. Help with generating creative content, stories, and engaging narratives. Focus on originality and compelling storytelling.",
  },
];

export default function EditAssistantCard({
  assistant,
  isLoading,
  onUpdate,
}: EditAssistantCardProps) {
  const [editedAssistant, setEditedAssistant] = useState(assistant);
  const [activeTab, setActiveTab] = useState("general");
  const [showInstructionsPresets, setShowInstructionsPresets] = useState(false);

  const handleSave = () => {
    const updatedConfig = {
      name: editedAssistant.name,
      instructions: editedAssistant.instructions,
      model: editedAssistant.model,
      tools: (editedAssistant.tools || [])
        .map((toolId: string) => {
          const tool = TOOL_OPTIONS.find((t) => t.id === toolId);
          if (!tool) return null;
          return { type: tool.type };
        })
        .filter(
          (tool: { type: string } | null): tool is { type: string } =>
            tool !== null
        ),
    };
    onUpdate(updatedConfig);
  };

  const handleToolToggle = (toolId: string) => {
    const tools = editedAssistant.tools || [];
    const hasToolEnabled = tools.includes(toolId);

    setEditedAssistant({
      ...editedAssistant,
      tools: hasToolEnabled
        ? tools.filter((t: string) => t !== toolId)
        : [...tools, toolId],
    });
  };

  const ModelIcon = ({ model }: { model: string }) => {
    if (model.includes("gpt-4")) {
      return <Sparkles className="h-4 w-4 text-purple-500" />;
    }
    return <Bot className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10">
      <CardHeader className="border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Assistant Configuration
            </CardTitle>
            <CardDescription className="text-gray-300">
              Customize your AI assistant's behavior and capabilities
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSave}
                  disabled={isLoading}
                  className="border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10"
                >
                  <Save className="h-4 w-4 text-blue-400" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save Changes</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-[#0A0F1E]/50">
            <TabsTrigger
              value="general"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              <Settings2 className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger
              value="capabilities"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              <Brain className="h-4 w-4 mr-2" />
              Capabilities
            </TabsTrigger>
            <TabsTrigger
              value="instructions"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Instructions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-200 font-medium">
                  Assistant Name
                </Label>
                <Input
                  id="name"
                  value={editedAssistant.name}
                  onChange={(e) =>
                    setEditedAssistant({
                      ...editedAssistant,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter assistant name"
                  className="bg-[#0A0F1E]/50 text-gray-100 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-gray-200 font-medium"
                >
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={editedAssistant.description}
                  onChange={(e) =>
                    setEditedAssistant({
                      ...editedAssistant,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your assistant's purpose"
                  className="bg-[#0A0F1E]/50 text-gray-100 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model" className="text-gray-200 font-medium">
                  Model
                </Label>
                <Select
                  value={editedAssistant.model}
                  onValueChange={(value) =>
                    setEditedAssistant({ ...editedAssistant, model: value })
                  }
                >
                  <SelectTrigger className="bg-[#0A0F1E]/50 text-gray-100 border-white/10">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0F1E] border-white/10">
                    {MODEL_OPTIONS.map((model) => (
                      <SelectItem
                        key={model.value}
                        value={model.value}
                        className="text-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <ModelIcon model={model.value} />
                          <div className="flex flex-col">
                            <span className="font-medium">{model.label}</span>
                            <span className="text-xs text-gray-400">
                              {model.description}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-6">
            <div className="space-y-4">
              {TOOL_OPTIONS.map((tool) => {
                const Icon = tool.icon;
                const isEnabled =
                  editedAssistant.tools &&
                  editedAssistant.tools.includes(tool.id);

                return (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-white/10 bg-[#0A0F1E]/30 hover:bg-[#0A0F1E]/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          isEnabled
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/10 text-gray-400"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-100">
                          {tool.name}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {tool.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => handleToolToggle(tool.id)}
                      className="data-[state=checked]:bg-blue-500"
                    />
                  </div>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="instructions" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="instructions"
                  className="text-gray-200 font-medium"
                >
                  System Instructions
                </Label>
                <Dialog
                  open={showInstructionsPresets}
                  onOpenChange={setShowInstructionsPresets}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/10 text-blue-400"
                    >
                      Load Preset
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0A0F1E] border-white/10">
                    <DialogHeader>
                      <DialogTitle className="text-gray-100">
                        Instruction Presets
                      </DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Choose from pre-defined instruction templates
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] pr-4">
                      <div className="space-y-4">
                        {PRESET_INSTRUCTIONS.map((preset) => (
                          <Card
                            key={preset.title}
                            className="cursor-pointer hover:bg-white/5 transition-colors border-white/10 bg-[#0A0F1E]/30"
                            onClick={() => {
                              setEditedAssistant({
                                ...editedAssistant,
                                instructions: preset.content,
                              });
                              setShowInstructionsPresets(false);
                            }}
                          >
                            <CardHeader>
                              <CardTitle className="text-sm text-gray-100">
                                {preset.title}
                              </CardTitle>
                              <CardDescription className="text-xs text-gray-400">
                                {preset.content}
                              </CardDescription>
                            </CardHeader>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
              <Textarea
                id="instructions"
                value={editedAssistant.instructions || ""}
                onChange={(e) =>
                  setEditedAssistant({
                    ...editedAssistant,
                    instructions: e.target.value,
                  })
                }
                placeholder="Enter system instructions for the assistant"
                className="min-h-[200px] bg-[#0A0F1E]/50 text-gray-100 border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20"
              />
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="border-blue-500/20 text-blue-400"
                >
                  Use {"{user}"} for user's name
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/20 text-blue-400"
                >
                  Use {"{context}"} for conversation context
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-500/20 text-blue-400"
                >
                  Use {"{datetime}"} for current time
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
