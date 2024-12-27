import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Demo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-primary">HealthDoc AI</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered document interaction for healthcare professionals
        </p>
      </header>

      <main className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Document Upload</CardTitle>
            <CardDescription>
              Upload a document to interact with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="document">Document</Label>
              <Input id="document" type="file" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Upload</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Chat</CardTitle>
            <CardDescription>
              Ask questions about your documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="question">Your Question</Label>
              <Input id="question" placeholder="Ask about your document..." />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Ask AI</Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
