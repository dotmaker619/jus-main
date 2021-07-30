import { NestedTreeControl, TreeControl } from '@angular/cdk/tree';
import { Component, ChangeDetectionStrategy, Input, SimpleChanges, OnChanges, Output, EventEmitter } from '@angular/core';
import { JuslawDocumentType } from '@jl/common/core/models/document-type';
import { JuslawDocument } from '@jl/common/core/models/juslaw-document';
import { DocumentAction, JuslawDocuments } from '@jl/common/core/models/juslaw-documents';
import { ReplaySubject, Observable } from 'rxjs';
import { scan } from 'rxjs/operators';

/** Document node model. */
export class Node {
  private static expandableTypes = [
    JuslawDocumentType.Folder,
    JuslawDocumentType.SharedFolder,
    JuslawDocumentType.GlobalTemplateFolder,
    JuslawDocumentType.TemplateFolder,
  ];

  /** @constructor */
  public constructor(
    /** Document. */
    public readonly doc: JuslawDocument,
    /** Child nodes. */
    public readonly children: Node[] = [],
    /** Whether the node is collapsed. */
    public isCollapsed: boolean = true,
  ) { }

  /** Is node expandable. */
  public get isExpandable(): boolean {
    return Node.expandableTypes.includes(this.doc.type);
  }

  /**
   * For each child execute a callback.
   * @param cb Callback.
   */
  public forEachChild(cb: (child: Node) => void): void {
    if (!cb) {
      return;
    }
    this.children.forEach(child => {
      cb(child);
      child.forEachChild(cb);
    });
  }

  /**
   * Finds a node that matches the predicate.
   * @param cb Predicate.
   */
  public find(cb: (child: Node) => boolean): Node {
    if (!cb) {
      return;
    }
    if (cb(this)) {
      return this;
    }

    const child = this.children.find(cb);

    if (child) {
      return child;
    }

    return this.children.map(c => c.find(cb)).find(c => c != null);
  }
}

class JuslawDocumentTreeControl extends NestedTreeControl<Node> {
  /** @inheritdoc */
  public isExpanded(dataNode: Node): boolean {
    return !dataNode.isCollapsed;
  }

  /** @inheritdoc */
  public toggle(dataNode: Node): void {
    dataNode.isCollapsed = !dataNode.isCollapsed;
  }

  /** @inheritdoc */
  public expand(dataNode: Node): void {
    dataNode.isCollapsed = false;
  }

  /** @inheritdoc */
  public collapse(dataNode: Node): void {
    dataNode.isCollapsed = true;
  }
}

/** Emitted Document action. */
export interface EmittedDocumentAction {
  /** Action to perform. */
  action: DocumentAction;
  /** Document. */
  document: JuslawDocument;
}

/** Attorney documents tree component. */
@Component({
  selector: 'jlc-documents-tree',
  templateUrl: './documents-tree.component.html',
  styleUrls: ['./documents-tree.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsTreeComponent {

  /** Documents. */
  @Input()
  public set documents(docs: JuslawDocument[]) {
    if (docs) {
      this.nodeTree$.next(this.parseDocumentsTree(docs));
    }
  }

  /** Current node tree. */
  public readonly nodeTree$ = new ReplaySubject<Node[]>(1);

  /** Should display header and 'Uploaded By', 'Date Created' columns */
  @Input()
  public showHeader = false;

  /** Document action emitter. */
  @Output()
  public readonly documentAction = new EventEmitter<EmittedDocumentAction>();

  /** Nested tree control. */
  public readonly treeControl = new JuslawDocumentTreeControl((node: Node) => node.children);

  /** Data source. */
  public readonly dataSource$: Observable<Node[]>;

  /** Selected node. */
  public readonly selectedNode$ = new ReplaySubject<Node>(1);

  /** Make document action human-readable. */
  public readonly toReadableAction = JuslawDocuments.actionToReadable;

  /** Checks whether the node has children. */
  public hasChild = (_: number, node: Node) => node.isExpandable;

  /** @inheritdoc */
  public constructor() {
    const tree$ = this.nodeTree$.pipe(
      scan((prevTree, newTree) => {
        if (prevTree == null) {
          return newTree;
        }
        this.inheritCollapseStateFromTree(newTree, prevTree);
        return newTree;
      }),
    );
    this.dataSource$ = tree$;
  }

  private inheritCollapseStateFromTree(newTree: Node[], prevTree: Node[]): void {
    newTree.forEach(root => {
      const samePrevRoot = prevTree.find(prevRoot => prevRoot.doc.id === root.doc.id);
      if (!samePrevRoot) {
        return;
      }

      root.isCollapsed = samePrevRoot.isCollapsed;
      root.forEachChild(child => {
        const prevSameChildNode = samePrevRoot.find(node => child.doc.id === node.doc.id);
        if (prevSameChildNode) {
          child.isCollapsed = prevSameChildNode.isCollapsed;
        }
      });
    });
  }

  /** Set selected node. */
  public onNodeOptionsClick(node: Node): void {
    this.selectedNode$.next(node);
  }

  /** Copy file. */
  public onOptionClick(node: Node, action: DocumentAction): void {
    this.documentAction.next({
      action,
      document: node.doc,
    });
  }

  /** Checks whether the element might be viewed. */
  public mightBeViewed(fileUrl: string): boolean {
    return fileUrl && fileUrl.endsWith('pdf');
  }

  /**
   * Trackby function.
   * @param doc Document.
   * @returns Short description of a node and its children.
   */
  public trackByFn = (_: number, { doc, children }: Node): string => {
    // Return concatenation of id of a parent component and ids of its children recursively.
    const childrenDescription = children ?
      children.map(child => this.trackByFn(_, child)).join() : ';';
    // Check title too - to update on folder renaming
    return `${doc.id.toString()}-${doc.title}` + childrenDescription;
  }

  private parseDocumentsTree(flatDocs: JuslawDocument[]): Node[] {
    const roots = flatDocs.filter(d => d.parent == null);
    // Check whether the parent folders are presented in docs array, otherwise use flat array of files
    return (roots.length ? roots : flatDocs).map(d => new Node(d, this.getChildren(d, flatDocs)));
  }

  private getChildren(parentDoc: JuslawDocument, flatDocs: JuslawDocument[]): Node[] {
    const children = flatDocs.filter(({ parent, type }) =>
      // Type is checked to avoid id collisions between different types of documents
      // TODO (Viktor C.): Figure out how to make id unique so that we won't need to check the type
      parent === parentDoc.id && parentDoc.isFolder,
    );
    return children.map(c => new Node(c, this.getChildren(c, flatDocs)));
  }
}
