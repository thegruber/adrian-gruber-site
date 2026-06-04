"use client";

import { motion } from "motion/react";
import { useState } from "react";
import type { WorkItem } from "@/components/work-data";

type WorkIndexProps = {
  items: WorkItem[];
};

export function WorkIndex({ items }: WorkIndexProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className="work-index">
      <ul className="work-list" aria-label="Selected products">
        {items.map((item) => (
          <WorkRow
            active={item.id === activeItem?.id}
            item={item}
            key={item.id}
            onActivate={() => setActiveId(item.id)}
          />
        ))}
      </ul>

      {activeItem ? (
        <motion.aside
          aria-live="polite"
          className={`work-preview-card work-detail-plane is-${activeItem.accent}`}
          initial={false}
          key={activeItem.id}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="work-detail-topline">
            <span>{activeItem.index}</span>
            <span>{activeItem.status}</span>
          </div>
          <div className="work-detail-copy">
            <strong>{activeItem.title}</strong>
            <p>{activeItem.detail}</p>
          </div>
          <dl className="work-detail-meta">
            <div>
              <dt>role</dt>
              <dd>{activeItem.role}</dd>
            </div>
            <div>
              <dt>focus</dt>
              <dd>{activeItem.focus}</dd>
            </div>
            <div>
              <dt>field</dt>
              <dd>{activeItem.meta}</dd>
            </div>
          </dl>
          <div className="work-signal-list" aria-label={`${activeItem.title} signals`}>
            {activeItem.signals.map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
          {activeItem.href ? (
            <a className="work-detail-action" href={activeItem.href} rel="noreferrer" target="_blank">
              {activeItem.cta}
            </a>
          ) : (
            <span className="work-detail-action is-muted" aria-disabled="true">
              {activeItem.cta}
            </span>
          )}
        </motion.aside>
      ) : null}
    </div>
  );
}

function WorkRow({ active, item, onActivate }: { active: boolean; item: WorkItem; onActivate: () => void }) {
  const rowContent = (
    <>
      <span className="work-row-index">{item.index}</span>
      <span className="work-row-main">
        <span className="work-row-title">{item.title}</span>
        <span className="work-row-desc">{item.description}</span>
      </span>
      <span className="work-row-meta">
        <span>{item.status}</span>
        <span>{item.meta}</span>
      </span>
      <span className="work-row-year">{item.year}</span>
    </>
  );

  const sharedProps = {
    className: `work-row is-${item.accent}${active ? " is-active" : ""}`,
    onFocus: onActivate,
    onPointerEnter: onActivate,
    onPointerMove: onActivate,
  };

  const content = item.href ? (
    <motion.a
      {...sharedProps}
      href={item.href}
      rel="noreferrer"
      target="_blank"
      whileHover={{ x: 8 }}
      whileTap={{ scale: 0.99 }}
    >
      {rowContent}
    </motion.a>
  ) : (
    <motion.button
      {...sharedProps}
      type="button"
      onClick={onActivate}
      whileHover={{ x: 8 }}
      whileTap={{ scale: 0.99 }}
    >
      {rowContent}
    </motion.button>
  );

  return <li>{content}</li>;
}
