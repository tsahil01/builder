import { StepType } from "@/types/types";

let stepId = 1;

function getStep(action: string) {
    const typeMatch = action.match(/<boltAction[^>]*type="([^"]+)"/);
    const type = typeMatch ? typeMatch[1] : null;
    const filePathMatch = action.match(/<boltAction[^>]*filePath="([^"]+)"/);
    const filePath = filePathMatch ? filePathMatch[1] : null;
    const contentMatch = action.match(/<boltAction[^>]*>([\s\S]*?)<\/boltAction>/);
    const content = contentMatch ? contentMatch[1] : "";

    if (type === 'file') {
        return ({
            id: stepId++,
            title: `Create ${filePath || 'file'}`,
            description: '',
            type: StepType.CreateFile,
            status: 'pending',
            code: content.trim(),
            path: filePath
        });
    } else if (type === 'shell') {
        return ({
            id: stepId++,
            title: 'Run command',
            description: '',
            type: StepType.RunScript,
            status: 'pending',
            code: content.trim()
        });
    }
    return null;
}

export class ArtifactParser {
    private content: string;
    private contentBeforeArtifact: string;
    private contentAfterArtifact: string;
    private actions: string[];
    private artifactTitle: string;
    private artifactId: string;

    constructor() {
        this.content = '';
        this.contentBeforeArtifact = '';
        this.contentAfterArtifact = '';
        this.actions = [];
        this.artifactTitle = '';
        this.artifactId = '';
    }

    addChunk(chunk: string) {
        this.content += chunk;

        if (!this.artifactId) {
            const idMatch = this.content.match(/<boltArtifact[^>]*id="([^"]+)"/);
            if (idMatch) this.artifactId = idMatch[1];
        }
        if (!this.artifactTitle) {
            const titleMatch = this.content.match(/<boltArtifact[^>]*title="([^"]+)"/);
            if (titleMatch) this.artifactTitle = titleMatch[1];
        }
        if (!this.contentBeforeArtifact) {
            const startIdx = this.content.indexOf("<boltArtifact");
            if (startIdx !== -1) {
                this.contentBeforeArtifact = this.content.substring(0, startIdx);
            }
        }
        if (!this.contentAfterArtifact) {
            const endIdx = this.content.indexOf("</boltArtifact>");
            if (endIdx !== -1) {
                this.contentAfterArtifact = this.content.substring(endIdx + "</boltArtifact>".length);
            }
        }

        while (true) {
            const actionStartIdx = this.content.indexOf("<boltAction");
            const actionEndIdx = this.content.indexOf("</boltAction>");

            console.log("actionStartIdx: ", actionStartIdx)
            console.log("actionEndIdx: ", actionEndIdx)

            if (actionStartIdx === -1 || actionEndIdx === -1) {
                break;
            }

            const actionChunk = this.content.substring(actionStartIdx, actionEndIdx + "</boltAction>".length);
            this.actions.push(actionChunk);
            this.content = this.content.replace(actionChunk, "");
        }
    }

    sendAction() {
        if (this.actions.length === 0) return;
        const action = this.actions.shift(); // rmove the first action
        if (!action) return;
        const step = getStep(action);
        if (step) {
            return step;
        }
        return null;
    }

    getActions(): string[] {
        return this.actions;
    }

    getContent(): string {
        return this.content;
    }

    getContentBeforeArtifact(): string {
        return this.contentBeforeArtifact;
    }

    getContentAfterArtifact(): string {
        return this.contentAfterArtifact;
    }
}
