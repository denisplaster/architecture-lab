import type { Diagram as DiagramSpec, DiagramNode } from "../../content/types";

/**
 * Declarative box-and-arrow renderer. Content describes nodes on a grid and
 * edges between them; this draws them consistently in both themes. Keeping
 * the drawing logic here means every lesson diagram looks like the others
 * and authors never write SVG.
 */

const COL_W = 204;
const ROW_H = 96;
const NODE_W = 160;
const NODE_H = 54;
const PAD_X = 20;
const PAD_Y = 26;
const GROUP_PAD = 10;
const GROUP_TOP = 26;

interface Placed {
  node: DiagramNode;
  x: number;
  y: number;
  cx: number;
  cy: number;
}

function place(node: DiagramNode): Placed {
  const x = PAD_X + node.col * COL_W;
  const y = PAD_Y + node.row * ROW_H;
  return { node, x, y, cx: x + NODE_W / 2, cy: y + NODE_H / 2 };
}

/** Where an edge leaves/enters a node box, given the other end's centre. */
function anchor(p: Placed, towards: { cx: number; cy: number }) {
  const dx = towards.cx - p.cx;
  const dy = towards.cy - p.cy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { x: dx >= 0 ? p.x + NODE_W : p.x, y: p.cy, horizontal: true };
  }
  return { x: p.cx, y: dy >= 0 ? p.y + NODE_H : p.y, horizontal: false };
}

function edgePath(a: Placed, b: Placed) {
  const from = anchor(a, b);
  const to = anchor(b, a);
  if (from.horizontal && to.horizontal) {
    if (Math.abs(from.y - to.y) < 1) {
      // Neighbouring columns leave little room on the line itself, so the
      // label sits just above the boxes, centred on the gap.
      return {
        d: `M${from.x},${from.y} L${to.x},${to.y}`,
        lx: (from.x + to.x) / 2,
        ly: a.y - 10,
      };
    }
    const mx = (from.x + to.x) / 2;
    return {
      d: `M${from.x},${from.y} H${mx} V${to.y} H${to.x}`,
      lx: mx,
      ly: (from.y + to.y) / 2,
    };
  }
  if (!from.horizontal && !to.horizontal) {
    if (Math.abs(from.x - to.x) < 1) {
      return {
        d: `M${from.x},${from.y} L${to.x},${to.y}`,
        lx: from.x,
        ly: (from.y + to.y) / 2,
      };
    }
    const my = (from.y + to.y) / 2;
    return {
      d: `M${from.x},${from.y} V${my} H${to.x} V${to.y}`,
      lx: (from.x + to.x) / 2,
      ly: my,
    };
  }
  // Mixed: one elbow.
  if (from.horizontal) {
    return {
      d: `M${from.x},${from.y} H${to.x} V${to.y}`,
      lx: (from.x + to.x) / 2,
      ly: from.y,
    };
  }
  return {
    d: `M${from.x},${from.y} V${to.y} H${to.x}`,
    lx: from.x,
    ly: (from.y + to.y) / 2,
  };
}

function fillFor(kind: DiagramNode["kind"]) {
  switch (kind) {
    case "ui":
      return "var(--diagram-ui)";
    case "data":
      return "var(--diagram-data)";
    case "queue":
      return "var(--diagram-queue)";
    case "external":
      return "var(--diagram-external)";
    case "note":
      return "transparent";
    default:
      return "var(--diagram-service)";
  }
}

function NodeShape({ p }: { p: Placed }) {
  const { node, x, y } = p;
  const kind = node.kind ?? "service";
  const fill = fillFor(kind);
  const stroke = kind === "external" ? "var(--fg-faint)" : "var(--line-strong)";
  const dash =
    kind === "queue" ? "5 3" : kind === "external" ? "2 3" : undefined;

  let shape: React.ReactNode;
  if (kind === "data") {
    const ry = 7;
    shape = (
      <>
        <path
          d={`M${x},${y + ry} v${NODE_H - 2 * ry} a${NODE_W / 2},${ry} 0 0 0 ${NODE_W},0 v-${NODE_H - 2 * ry}`}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.2}
        />
        <ellipse
          cx={x + NODE_W / 2}
          cy={y + ry}
          rx={NODE_W / 2}
          ry={ry}
          fill={fill}
          stroke={stroke}
          strokeWidth={1.2}
        />
      </>
    );
  } else if (kind === "note") {
    shape = null;
  } else {
    shape = (
      <rect
        x={x}
        y={y}
        width={NODE_W}
        height={NODE_H}
        rx={kind === "ui" ? 12 : 6}
        fill={fill}
        stroke={stroke}
        strokeWidth={1.2}
        strokeDasharray={dash}
      />
    );
  }
  const labelY = node.sub ? y + NODE_H / 2 - 3 : y + NODE_H / 2 + 4;
  return (
    <g>
      {shape}
      <text
        x={x + NODE_W / 2}
        y={labelY}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fontFamily="var(--font-sans)"
        fill={kind === "note" ? "var(--fg-dim)" : "var(--fg)"}
        fontStyle={kind === "note" ? "italic" : undefined}
      >
        {node.label}
      </text>
      {node.sub && (
        <text
          x={x + NODE_W / 2}
          y={y + NODE_H / 2 + 13}
          textAnchor="middle"
          fontSize={10}
          fontFamily="var(--font-mono)"
          fill="var(--fg-faint)"
        >
          {node.sub}
        </text>
      )}
    </g>
  );
}

export function Diagram({ diagram, id }: { diagram: DiagramSpec; id: string }) {
  const placed = new Map(diagram.nodes.map((n) => [n.id, place(n)]));
  const cols = Math.max(...diagram.nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...diagram.nodes.map((n) => n.row)) + 1;
  const width = PAD_X * 2 + (cols - 1) * COL_W + NODE_W;
  const height = PAD_Y * 2 + (rows - 1) * ROW_H + NODE_H;
  const markerId = `arrow-${id}`;

  return (
    <figure className="my-6">
      <div className="overflow-x-auto rounded-lg border border-line bg-sunken/60 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={diagram.caption ?? "Architecture diagram"}
          style={{
            width: "100%",
            height: "auto",
            minWidth: Math.min(width, 560),
            maxWidth: width * 1.15,
            display: "block",
          }}
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill="var(--fg-dim)" />
            </marker>
          </defs>

          {diagram.groups?.map((g, i) => {
            const members = g.nodeIds
              .map((n) => placed.get(n))
              .filter((p): p is Placed => !!p);
            if (!members.length) return null;
            const x0 = Math.min(...members.map((m) => m.x)) - GROUP_PAD;
            const y0 = Math.min(...members.map((m) => m.y)) - GROUP_TOP;
            const x1 =
              Math.max(...members.map((m) => m.x + NODE_W)) + GROUP_PAD;
            const y1 =
              Math.max(...members.map((m) => m.y + NODE_H)) + GROUP_PAD;
            return (
              <g key={i}>
                <rect
                  x={x0}
                  y={y0}
                  width={x1 - x0}
                  height={y1 - y0}
                  rx={10}
                  fill="var(--diagram-group)"
                  stroke="var(--line-strong)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <text
                  x={x0 + 10}
                  y={y0 + 16}
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  letterSpacing="0.06em"
                  fill="var(--fg-faint)"
                >
                  {g.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          {diagram.edges.map((e, i) => {
            const a = placed.get(e.from);
            const b = placed.get(e.to);
            if (!a || !b) return null;
            const { d, lx, ly } = edgePath(a, b);
            const labelW = e.label ? e.label.length * 6.1 + 10 : 0;
            return (
              <g key={i}>
                <path
                  d={d}
                  fill="none"
                  stroke="var(--fg-dim)"
                  strokeWidth={1.3}
                  strokeDasharray={e.style === "dashed" ? "5 4" : undefined}
                  markerEnd={`url(#${markerId})`}
                  markerStart={
                    e.bidirectional ? `url(#${markerId})` : undefined
                  }
                />
                {e.label && (
                  <g>
                    <rect
                      x={lx - labelW / 2}
                      y={ly - 8}
                      width={labelW}
                      height={16}
                      rx={3}
                      fill="var(--bg-elev)"
                      stroke="var(--line)"
                    />
                    <text
                      x={lx}
                      y={ly + 3.5}
                      textAnchor="middle"
                      fontSize={10}
                      fontFamily="var(--font-mono)"
                      fill="var(--fg-dim)"
                    >
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {Array.from(placed.values()).map((p) => (
            <NodeShape key={p.node.id} p={p} />
          ))}
        </svg>
      </div>
      {diagram.caption && (
        <figcaption className="mt-2 text-sm text-dim">
          {diagram.caption}
        </figcaption>
      )}
    </figure>
  );
}
