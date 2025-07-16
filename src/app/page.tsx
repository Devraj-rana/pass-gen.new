"use client";

import { useState, useEffect, useCallback } from "react";
import { enhancePassword, type EnhancePasswordOutput } from "@/ai/flows/enhance-password";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, ClipboardCopy, Loader2, RefreshCcw, Sparkles, Eye, EyeOff } from "lucide-react";

type PasswordOptions = {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

export default function Home() {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [strength, setStrength] = useState(0);
  const [strengthLabel, setStrengthLabel] = useState("Weak");
  const [isCopied, setIsCopied] = useState(false);
  const [isAiCopied, setIsAiCopied] = useState(false);
  
  const [aiPassword, setAiPassword] = useState("");
  const [showAiPassword, setShowAiPassword] = useState(false);
  const [aiResult, setAiResult] = useState<EnhancePasswordOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const { toast } = useToast();

  const generatePassword = useCallback(() => {
    const charSets = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    };

    let availableChars = "";
    let newPassword = "";
    const selectedOptions: (keyof PasswordOptions)[] = [];

    (Object.keys(options) as (keyof PasswordOptions)[]).forEach((key) => {
      if (options[key]) {
        availableChars += charSets[key];
        selectedOptions.push(key);
      }
    });

    if (availableChars.length === 0) {
      setPassword("");
      return;
    }
    
    // Ensure the password includes at least one character from each selected type
    for(const key of selectedOptions) {
        newPassword += charSets[key][Math.floor(Math.random() * charSets[key].length)];
    }

    for (let i = selectedOptions.length; i < length; i++) {
      newPassword += availableChars[Math.floor(Math.random() * availableChars.length)];
    }

    // Shuffle the generated password to randomize character positions
    setPassword(newPassword.split('').sort(() => Math.random() - 0.5).join(''));
    setIsCopied(false);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [length, options, generatePassword]);

  useEffect(() => {
    let score = 0;
    if (length >= 12) score += 40;
    else if (length >= 8) score += 20;

    let variety = 0;
    if (options.uppercase) variety++;
    if (options.lowercase) variety++;
    if (options.numbers) variety++;
    if (options.symbols) variety++;

    score += variety * 15;

    setStrength(score);

    if (score >= 80) setStrengthLabel("Very Strong");
    else if (score >= 60) setStrengthLabel("Strong");
    else if (score >= 40) setStrengthLabel("Medium");
    else setStrengthLabel("Weak");
  }, [password, length, options]);

  const handleCopy = useCallback(async (textToCopy: string, type: 'main' | 'ai') => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      if (type === 'main') {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } else {
        setIsAiCopied(true);
        setTimeout(() => setIsAiCopied(false), 2000);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy password to clipboard.",
        variant: "destructive",
      });
    }
  }, [toast]);
  
  const handleAiEnhance = async () => {
    if (!aiPassword) {
        toast({
            title: "Input Required",
            description: "Please enter a password to enhance.",
            variant: "destructive",
        });
        return;
    }
    setIsAiLoading(true);
    setAiResult(null);
    try {
        const result = await enhancePassword({ password: aiPassword });
        setAiResult(result);
    } catch (error) {
        console.error("AI enhancement failed:", error);
        toast({
            title: "AI Error",
            description: "Could not enhance password. Please try again later.",
            variant: "destructive",
        });
    } finally {
        setIsAiLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (strength >= 80) return "bg-green-500";
    if (strength >= 60) return "bg-teal-500";
    if (strength >= 40) return "bg-yellow-500";
    return "bg-red-500";
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-bold tracking-wider text-primary">PassForge</h1>
        <p className="mt-2 text-muted-foreground">Modern, secure password generation.</p>
      </header>
      
      <Tabs defaultValue="generator" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="enhancer">AI Enhancer</TabsTrigger>
        </TabsList>

        <TabsContent value="generator">
          <Card>
            <CardHeader>
              <CardTitle>Password Generator</CardTitle>
              <CardDescription>Create a strong and secure password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <Input value={password} readOnly className="pr-12 text-lg h-12 font-bold tracking-wider" aria-label="Generated Password"/>
                <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9" onClick={() => handleCopy(password, 'main')} aria-label="Copy password">
                  {isCopied ? <Check className="h-5 w-5 text-green-500" /> : <ClipboardCopy className="h-5 w-5" />}
                </Button>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Strength</Label>
                  <span className="text-sm font-medium">{strengthLabel}</span>
                </div>
                <Progress value={strength} className="h-3" indicatorClassName={getStrengthColor()} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Label htmlFor="length">Password Length</Label>
                    <span className="font-bold text-primary text-lg">{length}</span>
                </div>
                <Slider id="length" min={8} max={32} step={1} value={[length]} onValueChange={(value) => setLength(value[0])} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {(Object.keys(options) as (keyof PasswordOptions)[]).map((key) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={options[key]}
                      onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, [key]: !!checked }))}
                    />
                    <Label htmlFor={key} className="capitalize text-sm">
                      {key === 'uppercase' ? 'Uppercase' : key}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generatePassword} className="w-full glow-primary">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Generate New
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="enhancer">
          <Card>
            <CardHeader>
              <CardTitle>AI Password Enhancer</CardTitle>
              <CardDescription>Improve your existing password with AI suggestions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Input 
                      placeholder="Enter a password to enhance..." 
                      value={aiPassword}
                      onChange={(e) => setAiPassword(e.target.value)}
                      className="h-11 pr-12"
                      type={showAiPassword ? "text" : "password"}
                    />
                    <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9" onClick={() => setShowAiPassword(prev => !prev)} aria-label="Toggle password visibility">
                        {showAiPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </Button>
                  </div>
                  <Button onClick={handleAiEnhance} disabled={isAiLoading} className="glow-primary h-11 shrink-0">
                    {isAiLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <Sparkles className="h-5 w-5" />
                    )}
                    <span className="sr-only">Enhance</span>
                  </Button>
              </div>
            </CardContent>
            {isAiLoading && (
              <CardFooter>
                  <div className="text-center w-full p-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary"/>
                    <p className="mt-2 text-muted-foreground">AI is thinking...</p>
                  </div>
              </CardFooter>
            )}
            {aiResult && (
              <CardFooter className="flex-col items-start space-y-4">
                <div className="w-full space-y-2">
                    <Label>AI Suggestion</Label>
                    <div className="relative">
                        <Input value={aiResult.enhancedPassword} readOnly className="pr-12 text-md h-11 font-bold tracking-wider" aria-label="AI Enhanced Password"/>
                        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9" onClick={() => handleCopy(aiResult.enhancedPassword, 'ai')}>
                            {isAiCopied ? <Check className="h-5 w-5 text-green-500" /> : <ClipboardCopy className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>
                <div className="w-full space-y-2">
                    <Label>Strength Score</Label>
                    <Progress value={aiResult.strengthScore * 100} className="h-3" indicatorClassName="bg-green-500" />
                </div>
                <div className="w-full space-y-2">
                    <Label>Explanation</Label>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{aiResult.explanation}</p>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
