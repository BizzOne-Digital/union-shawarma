import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import './CustomizeModal.css';

const CustomizeModal = ({ item, onClose, onConfirm }) => {
  const [selections, setSelections] = useState({});

  const toggleSingle = (groupName, label) => {
    setSelections((prev) => ({ ...prev, [groupName]: [label] }));
  };

  const toggleMulti = (groupName, label) => {
    setSelections((prev) => {
      const current = prev[groupName] || [];
      const exists = current.includes(label);
      return { ...prev, [groupName]: exists ? current.filter((o) => o !== label) : [...current, label] };
    });
  };

  const extraTotal = useMemo(() => {
    let sum = 0;
    item.customizationGroups.forEach((group) => {
      (selections[group.name] || []).forEach((label) => {
        const opt = group.options.find((o) => o.label === label);
        if (opt?.extraPrice) sum += opt.extraPrice;
      });
    });
    return sum;
  }, [selections, item.customizationGroups]);

  const totalPrice = item.price + extraTotal;

  const handleConfirm = () => {
    for (const group of item.customizationGroups) {
      if (group.required && !(selections[group.name]?.length > 0)) {
        toast.error(`Please select ${group.name}`);
        return;
      }
    }
    onConfirm(selections, totalPrice);
  };

  return (
    <AnimatePresence>
      <motion.div className="customize-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="customize-modal"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="customize-close" onClick={onClose}><X size={20} /></button>

          <div className="customize-head">
            <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
            <div>
              <h3>{item.name}</h3>
              <span className="customize-price">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="customize-groups">
            {item.customizationGroups.map((group) => (
              <div className="customize-group" key={group.name}>
                <div className="customize-group-head">
                  <h4>{group.name}</h4>
                  {group.required && <span className="required-badge">Required</span>}
                </div>
                <div className="customize-options">
                  {group.options.map((option) => {
                    const selected = (selections[group.name] || []).includes(option.label);
                    return (
                      <button
                        key={option.label}
                        type="button"
                        className={`customize-option ${selected ? 'selected' : ''}`}
                        onClick={() => (group.multiSelect ? toggleMulti(group.name, option.label) : toggleSingle(group.name, option.label))}
                      >
                        {selected && <Check size={14} />}
                        {option.label}
                        {option.extraPrice > 0 && <span className="option-extra-price"> +${option.extraPrice.toFixed(2)}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-primary w-full customize-confirm" onClick={handleConfirm}>
            Add to Cart — ${totalPrice.toFixed(2)}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomizeModal;
