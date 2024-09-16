// ConfirmJoinDialog.tsx

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmJoinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmJoinDialog: React.FC<ConfirmJoinDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-950 text-white">
        <DialogHeader>
          <DialogTitle>This would send a request to the group admin</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to proceed?</p>
        <DialogFooter className="mt-4 flex justify-end gap-4">
          <Button variant="ghost" onClick={onClose} className="hover:bg-indigo-500">
            No
          </Button>
          <Button variant="ghost" onClick={onConfirm} className="hover:bg-indigo-500">
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmJoinDialog;
